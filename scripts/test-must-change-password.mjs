#!/usr/bin/env node

/**
 * Must-Change-Password Test - 409 Flow
 * Tests the complete must_change_password workflow
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

  // Parse Set-Cookie headers
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

async function testMustChangePasswordFlow() {
  console.log('\n🔒 Testing Must-Change-Password Flow (409)\n');

  // 1. Get CSRF
  console.log('→ 1. Get CSRF Cookie');
  let res = await request('GET', '/sanctum/csrf-cookie');
  console.log(`   ✅ Status ${res.status}`);

  // 2. Login as admin
  console.log('\n→ 2. Login as Admin');
  res = await request('POST', '/login', { employee_code: 'E0001', password: 'password' });
  console.log(`   ✅ Status ${res.status}`);

  // 3. Create user with must_change_password=true (simulate new user)
  console.log('\n→ 3. Create user E0006 with must_change_password=true');
  res = await request('POST', '/api/users', {
    employee_id: 6, // E0006 from seeder
    role: 'employee',
    default_password: 'TempPass123!'
  });
  if (res.status !== 201) {
    console.log(`   ❌ Create failed: ${res.status} - ${JSON.stringify(res.data)}`);
    return;
  }
  console.log(`   ✅ User created (ID: ${res.data.user.id})`);
  const testUserId = res.data.user.id;

  // 4. Logout admin
  console.log('\n→ 4. Logout admin');
  res = await request('POST', '/logout');
  console.log(`   ✅ Status ${res.status}`);

  // 5. Login as new user (should have must_change_password=true)
  console.log('\n→ 5. Login as E0006 (must_change_password=true)');
  res = await request('POST', '/login', { employee_code: 'E0006', password: 'TempPass123!' });
  if (res.status !== 200) {
    console.log(`   ❌ Login failed: ${res.status} - ${JSON.stringify(res.data)}`);
    return;
  }
  console.log(`   ✅ Login success - must_change_password: ${res.data.user.must_change_password}`);

  // 6. Try protected endpoint - should get 409
  console.log('\n→ 6. Try protected endpoint /api/employees (expect 409)');
  res = await request('GET', '/api/employees');
  const pass409 = res.status === 409 && res.data.error === 'MUST_CHANGE_PASSWORD';
  console.log(`   ${pass409 ? '✅' : '❌'} Status ${res.status} - Error: ${res.data?.error}`);

  // 7. Profile should still work (allowlisted)
  console.log('\n→ 7. Try /api/profile (should work - allowlisted)');
  res = await request('GET', '/api/profile');
  const profileWorks = res.status === 200;
  console.log(`   ${profileWorks ? '✅' : '❌'} Status ${res.status}`);

  // 8. Change password
  console.log('\n→ 8. Change password');
  res = await request('POST', '/api/change-password', {
    current_password: 'TempPass123!',
    password: 'NewPass123!',
    password_confirmation: 'NewPass123!'
  });
  const passwordChanged = res.status === 200;
  console.log(`   ${passwordChanged ? '✅' : '❌'} Status ${res.status}`);

  if (!passwordChanged) {
    console.log(`   Error: ${JSON.stringify(res.data)}`);
    return;
  }

  // 9. Try protected endpoint again - should work now
  console.log('\n→ 9. Try protected endpoint again (should work now)');
  res = await request('GET', '/api/users');
  const finalWorks = res.status === 200 || res.status === 403; // 403 is OK (role permission), not 409
  console.log(`   ${finalWorks ? '✅' : '❌'} Status ${res.status} (403 is OK - role issue, not password)`);

  // Cleanup - login as admin and delete test user
  console.log('\n→ Cleanup: Delete test user');
  res = await request('POST', '/logout');
  res = await request('POST', '/login', { employee_code: 'E0001', password: 'password' });
  res = await request('DELETE', `/api/users/${testUserId}`);
  console.log(`   ✅ Cleanup done`);

  console.log('\n📊 Must-Change-Password Flow Test Complete\n');
}

testMustChangePasswordFlow().catch(console.error);