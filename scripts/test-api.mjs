#!/usr/bin/env node

/**
 * API Test Script using direct HTTP calls
 * Skips Logout to maintain session for Phase 2 tests
 */

const BASE_URL = 'http://127.0.0.1:8000';

// Store cookies
let cookies = {};

// Helper to make requests
async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/`,
  };

  // Add cookies
  if (Object.keys(cookies).length > 0) {
    headers['Cookie'] = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  // Add XSRF token
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

// Test results
const results = [];
function test(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${name}${detail ? ` (${detail})` : ''}`);
}

async function runTests() {
  console.log('\n🧪 Mesoco API Tests\n');
  console.log('=' .repeat(60));

  // ============================================
  // PHASE 1 — Auth (Skip Logout)
  // ============================================
  console.log('\n📁 PHASE 1 - Auth\n');

  // 1. Get CSRF Cookie
  console.log('→ 1. Get CSRF Cookie');
  let res = await request('GET', '/sanctum/csrf-cookie');
  test('Status 204', res.status === 204, `got ${res.status}`);

  // 2. Login
  console.log('\n→ 2. Login (E0001/password)');
  res = await request('POST', '/login', { employee_code: 'E0001', password: 'password' });
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has user data', res.data?.user?.employee_code === 'E0001');

  // 3. Get Current User
  console.log('\n→ 3. Get Current User');
  res = await request('GET', '/api/me');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('User is E0001', res.data?.user?.employee_code === 'E0001');

  // 4. Forgot Password - Request (skip actual test, just check endpoint)
  console.log('\n→ 4. Forgot Password - Request');
  res = await request('POST', '/forgot-password/request', { email: 'admin@mesoco.vn' });
  test('Status 200', res.status === 200, `got ${res.status}`);

  // 5. Forgot Password - Reset (will fail without real OTP)
  console.log('\n→ 5. Forgot Password - Reset (expected 422 without OTP)');
  res = await request('POST', '/forgot-password/reset', { 
    email: 'admin@mesoco.vn', 
    verification_code: '000000', 
    password: 'NewPass123!',
    password_confirmation: 'NewPass123!'
  });
  test('Status 422 (invalid OTP)', res.status === 422, `got ${res.status}`);

  // 6. Change Password - Skip to avoid breaking login
  console.log('\n→ 6. Change Password (SKIPPED - would change password)');
  test('Skipped', true, 'preserving test credentials');

  // 7. Logout - SKIP!
  console.log('\n→ 7. Logout (SKIPPED - keeping session for Phase 2)');
  test('Skipped', true, 'session preserved');

  // ============================================
  // PHASE 2 — RBAC + Profile
  // ============================================
  console.log('\n' + '=' .repeat(60));
  console.log('\n📁 PHASE 2 - RBAC + Profile\n');

  // --- Profile ---
  console.log('📂 Profile\n');

  // 1. Get Profile
  console.log('→ 1. Get Profile');
  res = await request('GET', '/api/profile');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has employee_code', !!res.data?.profile?.employee_code);
  test('Has full_name', !!res.data?.profile?.full_name);
  test('Has email', !!res.data?.profile?.email);

  // 2. Update Profile (valid)
  console.log('\n→ 2. Update Profile (valid fields)');
  res = await request('PUT', '/api/profile', { full_name: 'Admin User', position: 'System Administrator', phone: '0901234567' });
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Message includes updated', res.data?.message?.includes('updated'));

  // 3. Update Profile (forbidden: employee_code)
  console.log('\n→ 3. Update Profile (forbidden: employee_code) → 422');
  res = await request('PUT', '/api/profile', { full_name: 'Test', employee_code: 'HACK001' });
  test('Status 422', res.status === 422, `got ${res.status}`);
  test('Error has employee_code', !!res.data?.errors?.employee_code);

  // 4. Update Profile (forbidden: email)
  console.log('\n→ 4. Update Profile (forbidden: email) → 422');
  res = await request('PUT', '/api/profile', { full_name: 'Test', email: 'hacker@evil.com' });
  test('Status 422', res.status === 422, `got ${res.status}`);
  test('Error has email', !!res.data?.errors?.email);

  // --- Employees (Admin/HR) ---
  console.log('\n📂 Employees (Admin/HR)\n');

  // 1. List Employees
  console.log('→ 1. List Employees');
  res = await request('GET', '/api/employees');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has employees array', Array.isArray(res.data?.employees));

  // 2. Get Available Employees
  console.log('\n→ 2. Get Available Employees (no user account)');
  res = await request('GET', '/api/employees/available');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has employees array', Array.isArray(res.data?.employees));

  // 3. Create Employee
  console.log('\n→ 3. Create Employee');
  const newEmpCode = `E${Date.now() % 10000}`;
  res = await request('POST', '/api/employees', {
    employee_code: newEmpCode,
    full_name: 'Test Employee',
    email: `test${Date.now()}@mesoco.vn`,
    position: 'Test',
    gender: 'male'
  });
  test('Status 201', res.status === 201, `got ${res.status}`);
  const testEmployeeId = res.data?.employee?.id;
  test('Got employee ID', !!testEmployeeId, `id=${testEmployeeId}`);

  // 4. Get Employee
  if (testEmployeeId) {
    console.log('\n→ 4. Get Employee');
    res = await request('GET', `/api/employees/${testEmployeeId}`);
    test('Status 200', res.status === 200, `got ${res.status}`);
  }

  // 5. Update Employee
  if (testEmployeeId) {
    console.log('\n→ 5. Update Employee');
    res = await request('PUT', `/api/employees/${testEmployeeId}`, { full_name: 'Updated Employee' });
    test('Status 200', res.status === 200, `got ${res.status}`);
  }

  // 6. Delete Employee
  if (testEmployeeId) {
    console.log('\n→ 6. Delete Employee');
    res = await request('DELETE', `/api/employees/${testEmployeeId}`);
    test('Status 200', res.status === 200, `got ${res.status}`);
  }

  // --- Users / Roles & Permission (Admin/HR) ---
  console.log('\n📂 Users / Roles & Permission (Admin/HR)\n');

  // 1. List Users
  console.log('→ 1. List Users');
  res = await request('GET', '/api/users');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has users array', Array.isArray(res.data?.users));
  test('Has available_roles', Array.isArray(res.data?.available_roles));

  // 2. Get Available Roles
  console.log('\n→ 2. Get Available Roles');
  res = await request('GET', '/api/roles');
  test('Status 200', res.status === 200, `got ${res.status}`);
  test('Has admin role', res.data?.roles?.includes('admin'));
  test('Has hr role', res.data?.roles?.includes('hr'));

  // Find available employee for user creation
  res = await request('GET', '/api/employees/available');
  const availableEmployee = res.data?.employees?.[0];

  // 3. Create User Account
  let testUserId = null;
  if (availableEmployee) {
    console.log('\n→ 3. Create User Account');
    res = await request('POST', '/api/users', {
      employee_id: availableEmployee.id,
      role: 'employee',
      default_password: 'Password123!'
    });
    test('Status 201', res.status === 201, `got ${res.status}`);
    testUserId = res.data?.user?.id;
    test('Got user ID', !!testUserId, `id=${testUserId}`);
  }

  // 5. Update User Role
  if (testUserId) {
    console.log('\n→ 5. Update User Role (PATCH)');
    res = await request('PATCH', `/api/users/${testUserId}/role`, { role: 'technician' });
    test('Status 200', res.status === 200, `got ${res.status}`);
  }

  // 6. Update User Role (forbidden: name)
  if (testUserId) {
    console.log('\n→ 6. Update User Role (forbidden: name) → 422');
    res = await request('PATCH', `/api/users/${testUserId}/role`, { role: 'employee', name: 'Hacked' });
    test('Status 422', res.status === 422, `got ${res.status}`);
    test('Error has name', !!res.data?.errors?.name);
  }

  // 7. Update User Role (forbidden: employee_code)
  if (testUserId) {
    console.log('\n→ 7. Update User Role (forbidden: employee_code) → 422');
    res = await request('PATCH', `/api/users/${testUserId}/role`, { role: 'employee', employee_code: 'HACK' });
    test('Status 422', res.status === 422, `got ${res.status}`);
    test('Error has employee_code', !!res.data?.errors?.employee_code);
  }

  // 8. Delete User
  if (testUserId) {
    console.log('\n→ 8. Delete User');
    res = await request('DELETE', `/api/users/${testUserId}`);
    test('Status 200', res.status === 200, `got ${res.status}`);
  }

  // --- RBAC Tests (Login as Doctor) ---
  console.log('\n📂 RBAC Tests (Doctor Role)\n');

  // Logout and login as doctor
  await request('POST', '/logout');
  await request('GET', '/sanctum/csrf-cookie');
  res = await request('POST', '/login', { employee_code: 'E0003', password: 'password' });
  test('Logged in as Doctor (E0003)', res.status === 200);

  // 9. Doctor cannot list employees
  console.log('\n→ RBAC: Doctor cannot list employees → 403');
  res = await request('GET', '/api/employees');
  test('Status 403', res.status === 403, `got ${res.status}`);
  test('Message has Forbidden', res.data?.message?.includes('Forbidden'));

  // 10. Doctor cannot list users
  console.log('\n→ RBAC: Doctor cannot list users → 403');
  res = await request('GET', '/api/users');
  test('Status 403', res.status === 403, `got ${res.status}`);
  test('Has your_role', !!res.data?.your_role);

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '=' .repeat(60));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Failed tests:');
    results.filter(r => !r.passed).forEach(r => console.log(`   - ${r.name} ${r.detail}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
