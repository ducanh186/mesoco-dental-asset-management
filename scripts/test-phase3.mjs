#!/usr/bin/env node

/**
 * Phase 3 API Test Script
 * Tests Assets + Assignment + QR Identity
 */

const BASE_URL = 'http://127.0.0.1:8000';
let cookies = {};

async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/`,
  };

  if (Object.keys(cookies).length > 0) {
    headers['Cookie'] = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  if (cookies['XSRF-TOKEN']) {
    headers['X-XSRF-TOKEN'] = decodeURIComponent(cookies['XSRF-TOKEN']);
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  const setCookies = response.headers.getSetCookie?.() || [];
  for (const cookie of setCookies) {
    const [pair] = cookie.split(';');
    const [name, value] = pair.split('=');
    if (value) cookies[name] = value;
  }

  let data = null;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

const results = [];
function test(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${name}${detail ? ` (${detail})` : ''}`);
}

async function runTests() {
  console.log('\n🧪 Phase 3 API Tests - Assets + Assignment + QR\n');
  console.log('=' .repeat(60));

  // ============================================
  // Setup: Login as Admin
  // ============================================
  console.log('\n📁 Setup\n');

  console.log('→ Get CSRF Cookie');
  let res = await request('GET', '/sanctum/csrf-cookie');
  test('CSRF 204', res.status === 204, `got ${res.status}`);

  console.log('\n→ Login as Admin (E0001)');
  res = await request('POST', '/login', { employee_code: 'E0001', password: 'password' });
  test('Login 200', res.status === 200, `got ${res.status}`);

  // ============================================
  // Assets CRUD (Admin)
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 PHASE 3 - Assets CRUD (Admin)\n');

  // 1. List Assets
  console.log('→ 1. List Assets');
  res = await request('GET', '/api/assets');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has assets array', Array.isArray(res.data?.assets));
  test('Has available_types', Array.isArray(res.data?.available_types));
  const initialAssetCount = res.data?.assets?.length || 0;
  console.log(`   Found ${initialAssetCount} assets`);

  // 2. Get Available Assets
  console.log('\n→ 2. Get Available Assets (unassigned)');
  res = await request('GET', '/api/assets/available');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has assets array', Array.isArray(res.data?.assets));
  console.log(`   Found ${res.data?.assets?.length || 0} available assets`);

  // 3. Create Asset
  console.log('\n→ 3. Create Asset');
  res = await request('POST', '/api/assets', {
    asset_code: 'TEST-API-001',
    name: 'API Test Asset',
    type: 'equipment',
    status: 'active',
    notes: 'Created by API test'
  });
  test('Status 201', res.status === 201, `got ${res.status}`);
  test('Has asset', !!res.data?.asset?.id);
  test('Has QR in asset', res.data?.asset?.qr?.payload?.startsWith('MESOCO|ASSET|v1|'));
  test('Has is_assigned flag', typeof res.data?.asset?.is_assigned === 'boolean');
  const testAssetId = res.data?.asset?.id;
  const testQrPayload = res.data?.asset?.qr?.payload;
  console.log(`   Asset ID: ${testAssetId}, QR: ${testQrPayload?.substring(0, 30)}...`);

  // 4. Get Asset
  console.log('\n→ 4. Get Asset');
  res = await request('GET', `/api/assets/${testAssetId}`);
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has asset_code', res.data?.asset?.asset_code === 'TEST-API-001');

  // 5. Update Asset
  console.log('\n→ 5. Update Asset');
  res = await request('PATCH', `/api/assets/${testAssetId}`, {
    name: 'Updated API Test Asset',
    notes: 'Updated by API test'
  });
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Name updated', res.data?.asset?.name === 'Updated API Test Asset');

  // ============================================
  // Assignment Workflow
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 PHASE 3 - Assignment Workflow\n');

  // 6. Assign Asset
  console.log('→ 6. Assign Asset to Employee (E0003 - Doctor)');
  res = await request('POST', `/api/assets/${testAssetId}/assign`, {
    employee_id: 3 // Doctor employee
  });
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has assignment', !!res.data?.assignment);

  // 7. Try assign again (should fail)
  console.log('\n→ 7. Try Assign Again (expect 422 ALREADY_ASSIGNED)');
  res = await request('POST', `/api/assets/${testAssetId}/assign`, {
    employee_id: 4 // Technician
  });
  test('Status 422', res.status === 422, `got ${res.status}`);
  test('Error ALREADY_ASSIGNED', res.data?.error === 'ALREADY_ASSIGNED');

  // 8. Unassign Asset
  console.log('\n→ 8. Unassign Asset');
  res = await request('POST', `/api/assets/${testAssetId}/unassign`);
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has previous_assignee', !!res.data?.previous_assignee);

  // 9. Try unassign again (should fail)
  console.log('\n→ 9. Try Unassign Again (expect 422 NOT_ASSIGNED)');
  res = await request('POST', `/api/assets/${testAssetId}/unassign`);
  test('Status 422', res.status === 422, `got ${res.status}`);
  test('Error NOT_ASSIGNED', res.data?.error === 'NOT_ASSIGNED');

  // ============================================
  // QR Resolution
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 PHASE 3 - QR Resolution\n');

  // 10. Resolve QR (valid)
  console.log('→ 10. Resolve QR Code (valid)');
  res = await request('POST', '/api/qr/resolve', { payload: testQrPayload });
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has asset', !!res.data?.asset);
  test('Asset code matches', res.data?.asset?.asset_code === 'TEST-API-001');
  test('Has is_assigned flag', typeof res.data?.is_assigned === 'boolean');

  // 11. Resolve QR (invalid format)
  console.log('\n→ 11. Resolve QR Code (invalid format)');
  res = await request('POST', '/api/qr/resolve', { payload: 'INVALID|FORMAT' });
  test('Status 422', res.status === 422, `got ${res.status}`);
  test('Error INVALID_QR_FORMAT', res.data?.error === 'INVALID_QR_FORMAT');

  // 12. Resolve QR (not found)
  console.log('\n→ 12. Resolve QR Code (not found)');
  res = await request('POST', '/api/qr/resolve', { 
    payload: 'MESOCO|ASSET|v1|00000000-0000-0000-0000-000000000000' 
  });
  test('Status 404', res.status === 404, `got ${res.status}`);
  test('Error QR_NOT_FOUND', res.data?.error === 'QR_NOT_FOUND');

  // 13. Regenerate QR
  console.log('\n→ 13. Regenerate QR Code');
  res = await request('POST', `/api/assets/${testAssetId}/regenerate-qr`);
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has new QR in asset', res.data?.asset?.qr?.payload?.startsWith('MESOCO|ASSET|v1|'));
  test('QR payload changed', res.data?.asset?.qr?.payload !== testQrPayload);
  const newQrPayload = res.data?.asset?.qr?.payload;

  // 14. Old QR should still resolve (we keep history)
  console.log('\n→ 14. Old QR still resolves (history kept)');
  res = await request('POST', '/api/qr/resolve', { payload: testQrPayload });
  test('Status 200', res.status === 200, `got ${res.status}`);

  // ============================================
  // RBAC Tests (Non-Admin)
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 PHASE 3 - RBAC Tests (Doctor Role)\n');

  // Logout and login as Doctor
  console.log('→ Switch to Doctor (E0003)');
  await request('POST', '/logout');
  res = await request('POST', '/login', { employee_code: 'E0003', password: 'password' });
  test('Logged in as Doctor', res.status === 200);

  // 15. Doctor can view my-assets
  console.log('\n→ 15. Doctor can view My Assets');
  res = await request('GET', '/api/my-assets');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has assets array', Array.isArray(res.data?.assets));
  console.log(`   Doctor has ${res.data?.assets?.length || 0} assigned assets`);

  // 16. Doctor cannot list all assets via /api/assets -> 403 (admin only)
  console.log('\n→ 16. Doctor /api/assets -> 403 (admin only)');
  res = await request('GET', '/api/assets');
  test('Status 403', res.status === 403, `got ${res.status}`);

  // 17. Doctor cannot create asset
  console.log('\n→ 17. Doctor cannot create asset -> 403');
  res = await request('POST', '/api/assets', {
    asset_code: 'HACK-001',
    name: 'Hacked Asset',
    type: 'tray'
  });
  test('Status 403', res.status === 403, `got ${res.status}`);

  // 18. Doctor cannot assign asset
  console.log('\n→ 18. Doctor cannot assign asset -> 403');
  res = await request('POST', '/api/assets/1/assign', { employee_id: 1 });
  test('Status 403', res.status === 403, `got ${res.status}`);

  // 19. Doctor CAN resolve QR (all users can)
  console.log('\n→ 19. Doctor CAN resolve QR');
  res = await request('POST', '/api/qr/resolve', { payload: newQrPayload });
  test('Status 200', res.status === 200, `got ${res.status}`);

  // ============================================
  // Cleanup + Soft Delete Test
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 Cleanup + Soft Delete Test\n');

  // Login back as admin
  await request('POST', '/logout');
  res = await request('POST', '/login', { employee_code: 'E0001', password: 'password' });
  
  // Delete test asset (soft delete)
  console.log('→ 20. Delete test asset (soft delete)');
  res = await request('DELETE', `/api/assets/${testAssetId}`);
  test('Delete successful', res.status === 200, `got ${res.status}`);

  // 21. QR resolve for deleted asset should return 404
  console.log('\n→ 21. QR resolve for deleted asset -> 404');
  res = await request('POST', '/api/qr/resolve', { payload: newQrPayload });
  test('Status 404', res.status === 404, `got ${res.status}`);
  test('Error ASSET_DELETED', res.data?.error === 'ASSET_DELETED');

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '=' .repeat(60));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}${r.detail ? ` (${r.detail})` : ''}`);
    });
    console.log('');
    process.exit(1);
  }
}

runTests().catch(console.error);
