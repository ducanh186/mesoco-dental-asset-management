#!/usr/bin/env node

/**
 * Mesoco Postman Collection Generator
 * 
 * Generates postman/mesoco.postman_collection.json from phase markdown files.
 * Environment files are static templates (not generated).
 * 
 * Usage: node scripts/generate-postman.mjs
 * 
 * After each phase:
 * 1. Update/create docs/postman/phases/PHASEX_*.md
 * 2. Run: node scripts/generate-postman.mjs
 * 3. Commit: git commit -am "Update Postman for Phase X"
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PHASES_DIR = join(ROOT_DIR, 'docs', 'postman', 'phases');
const OUTPUT_FILE = join(ROOT_DIR, 'postman', 'mesoco.postman_collection.json');

// Collection template
const collectionTemplate = {
  info: {
    _postman_id: 'mesoco-dental-api',
    name: 'Mesoco Dental Asset Management API',
    description: 'API collection for Mesoco Dental Asset Management System.\n\nOrganized by development phases.\n\n**How to use:**\n1. Import this collection\n2. Import environment (Local or Docker)\n3. Select environment from dropdown\n4. Run requests in order within each phase',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          '// === Mesoco Collection Pre-request Script ===',
          '',
          '// Get base URL for Origin/Referer headers',
          "const baseUrl = pm.environment.get('base_url') || 'http://localhost:8000';",
          '',
          '// Always set required headers for Sanctum SPA authentication',
          "pm.request.headers.upsert({ key: 'Accept', value: 'application/json' });",
          "pm.request.headers.upsert({ key: 'Origin', value: baseUrl });",
          "pm.request.headers.upsert({ key: 'Referer', value: baseUrl + '/' });",
          '',
          '// Set Content-Type for POST/PUT/PATCH',
          'const method = pm.request.method.toUpperCase();',
          "if (['POST', 'PUT', 'PATCH'].includes(method)) {",
          "    pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });",
          '}',
          '',
          '// Handle XSRF-TOKEN cookie for Sanctum',
          "const xsrfCookie = pm.cookies.get('XSRF-TOKEN');",
          'if (xsrfCookie) {',
          "    pm.request.headers.upsert({ key: 'X-XSRF-TOKEN', value: decodeURIComponent(xsrfCookie) });",
          '}'
        ]
      }
    }
  ],
  item: []
};

// Helper to create request body with JSON options
const jsonBody = (data) => ({
  mode: 'raw',
  raw: JSON.stringify(data, null, 2),
  options: { raw: { language: 'json' } }
});

// Helper to create test scripts
const testScript = (tests) => ({
  listen: 'test',
  script: {
    type: 'text/javascript',
    exec: tests
  }
});

// Phase 1 Auth endpoints
const phase1Items = [
  {
    name: '1. Get CSRF Cookie',
    request: {
      method: 'GET',
      header: [],
      url: '{{base_url}}{{csrf_path}}',
      description: 'Get Sanctum CSRF cookie. Must be called before any state-changing request.'
    }
  },
  {
    name: '2. Login',
    request: {
      method: 'POST',
      header: [],
      body: jsonBody({ employee_code: '{{employee_code}}', password: '{{password}}' }),
      url: '{{base_url}}/login',
      description: 'Login with employee code and password. Only employee_code is accepted (not email).'
    }
  },
  {
    name: '3. Get Current User',
    request: {
      method: 'GET',
      header: [],
      url: '{{base_url}}/api/me',
      description: 'Get currently authenticated user info. Requires authenticated session.'
    }
  },
  {
    name: '4. Forgot Password - Request OTP',
    request: {
      method: 'POST',
      header: [],
      body: jsonBody({ email: '{{email}}' }),
      url: '{{base_url}}/forgot-password/request',
      description: 'Request password reset OTP. DEV: Check storage/app/private/otp/password_reset_codes.log'
    }
  },
  {
    name: '5. Forgot Password - Reset',
    request: {
      method: 'POST',
      header: [],
      body: jsonBody({
        email: '{{email}}',
        verification_code: '{{otp_code}}',
        password: '{{new_password}}',
        password_confirmation: '{{new_password}}'
      }),
      url: '{{base_url}}/forgot-password/reset',
      description: 'Reset password using OTP. Uses password + password_confirmation (NOT new_password).'
    }
  },
  {
    name: '6. Change Password',
    request: {
      method: 'POST',
      header: [],
      body: jsonBody({
        current_password: '{{password}}',
        password: '{{new_password}}',
        password_confirmation: '{{new_password}}'
      }),
      url: '{{base_url}}/api/change-password',
      description: 'Change password for authenticated user. Uses password + password_confirmation (NOT new_password).'
    }
  },
  {
    name: '7. Logout',
    request: {
      method: 'POST',
      header: [],
      body: { mode: 'raw', raw: '', options: { raw: { language: 'json' } } },
      url: '{{base_url}}/logout',
      description: 'Logout and invalidate session.'
    }
  }
];

// Phase 2 Profile & RBAC endpoints
const phase2Items = [
  // === Profile Section ===
  {
    name: 'Profile',
    description: 'View and edit own profile. All authenticated users.',
    item: [
      {
        name: '1. Get Profile',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/profile',
          description: 'Get authenticated user profile. Returns employee data linked to user.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has profile fields", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.profile).to.have.property("employee_code");',
          '    pm.expect(json.profile).to.have.property("full_name");',
          '    pm.expect(json.profile).to.have.property("email");',
          '    pm.expect(json.profile).to.have.property("position");',
          '    pm.expect(json.profile).to.have.property("dob");',
          '    pm.expect(json.profile).to.have.property("gender");',
          '    pm.expect(json.profile).to.have.property("phone");',
          '    pm.expect(json.profile).to.have.property("address");',
          '});'
        ])]
      },
      {
        name: '2. Update Profile (valid fields)',
        request: {
          method: 'PUT',
          header: [],
          body: jsonBody({
            full_name: 'Updated Name',
            position: 'Updated Position',
            phone: '0999888777'
          }),
          url: '{{base_url}}/api/profile',
          description: 'Update profile with allowed fields only.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Profile updated", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.message).to.include("updated");',
          '});'
        ])]
      },
      {
        name: '3. Update Profile (forbidden: employee_code) → 422',
        request: {
          method: 'PUT',
          header: [],
          body: jsonBody({
            full_name: 'Test',
            employee_code: 'HACK001'
          }),
          url: '{{base_url}}/api/profile',
          description: 'MUST return 422 - employee_code is immutable.'
        },
        event: [testScript([
          'pm.test("Status is 422", () => pm.response.to.have.status(422));',
          'pm.test("Error mentions employee_code", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.errors).to.have.property("employee_code");',
          '});'
        ])]
      },
      {
        name: '4. Update Profile (forbidden: email) → 422',
        request: {
          method: 'PUT',
          header: [],
          body: jsonBody({
            full_name: 'Test',
            email: 'hacker@evil.com'
          }),
          url: '{{base_url}}/api/profile',
          description: 'MUST return 422 - email is immutable.'
        },
        event: [testScript([
          'pm.test("Status is 422", () => pm.response.to.have.status(422));',
          'pm.test("Error mentions email", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.errors).to.have.property("email");',
          '});'
        ])]
      }
    ]
  },
  // === Employees Section (Admin/HR only) ===
  {
    name: 'Employees (Admin/HR)',
    description: 'Employee management. Requires admin or hr role.',
    item: [
      {
        name: '1. List Employees',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/employees?search=&status=&per_page=15',
            host: ['{{base_url}}'],
            path: ['api', 'employees'],
            query: [
              { key: 'search', value: '' },
              { key: 'status', value: '' },
              { key: 'per_page', value: '15' }
            ]
          },
          description: 'List employees with optional filtering. Admin/HR only.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '2. Get Available Employees (no user account)',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/employees/available',
          description: 'Get employees without user accounts (for Add Employee popup).'
        }
      },
      {
        name: '3. Create Employee',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            employee_code: 'E9999',
            full_name: 'Test Employee',
            email: 'test9999@mesoco.vn',
            position: 'Test Position',
            dob: '1990-01-01',
            gender: 'male',
            phone: '0901234999',
            address: '999 Test Street'
          }),
          url: '{{base_url}}/api/employees',
          description: 'Create a new employee. Admin/HR only.'
        },
        event: [testScript([
          'pm.test("Status is 201 or 403", () => {',
          '    pm.expect([201, 403]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 201) {',
          '    pm.environment.set("test_employee_id", pm.response.json().employee.id);',
          '}'
        ])]
      },
      {
        name: '4. Get Employee',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/employees/{{test_employee_id}}',
          description: 'Get specific employee details.'
        }
      },
      {
        name: '5. Update Employee',
        request: {
          method: 'PUT',
          header: [],
          body: jsonBody({
            full_name: 'Updated Test Employee',
            position: 'Updated Position'
          }),
          url: '{{base_url}}/api/employees/{{test_employee_id}}',
          description: 'Update employee. Admin/HR only.'
        }
      },
      {
        name: '6. Delete Employee',
        request: {
          method: 'DELETE',
          header: [],
          url: '{{base_url}}/api/employees/{{test_employee_id}}',
          description: 'Delete employee. Cannot delete if has user account.'
        }
      },
      {
        name: '7. RBAC Test: Doctor cannot list employees → 403',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/employees',
          description: 'Test RBAC: Non-admin roles should get 403. Login as doctor first.'
        },
        event: [testScript([
          '// Run this after logging in as doctor',
          'pm.test("Status is 403 for non-admin", () => {',
          '    pm.response.to.have.status(403);',
          '});',
          'pm.test("Error message mentions permission", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.message).to.include("Forbidden");',
          '});'
        ])]
      }
    ]
  },
  // === Users Section (Roles & Permission - Admin/HR only) ===
  {
    name: 'Users / Roles & Permission (Admin/HR)',
    description: 'User account management. Requires admin or hr role.',
    item: [
      {
        name: '1. List Users',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/users?search=&role=&per_page=15',
            host: ['{{base_url}}'],
            path: ['api', 'users'],
            query: [
              { key: 'search', value: '' },
              { key: 'role', value: '' },
              { key: 'per_page', value: '15' }
            ]
          },
          description: 'List users with filtering. Columns: employee_code, name, role.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 200) {',
          '    pm.test("Has available_roles", () => {',
          '        pm.expect(pm.response.json()).to.have.property("available_roles");',
          '    });',
          '}'
        ])]
      },
      {
        name: '2. Get Available Roles',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/roles',
          description: 'Get list of available roles for dropdown.'
        },
        event: [testScript([
          'pm.test("Returns roles array", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.roles).to.be.an("array");',
          '    pm.expect(json.roles).to.include("admin");',
          '    pm.expect(json.roles).to.include("hr");',
          '    pm.expect(json.roles).to.include("doctor");',
          '    pm.expect(json.roles).to.include("technician");',
          '    pm.expect(json.roles).to.include("employee");',
          '});'
        ])]
      },
      {
        name: '3. Create User Account',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            employee_id: '{{available_employee_id}}',
            role: 'employee',
            default_password: 'Password123!'
          }),
          url: '{{base_url}}/api/users',
          description: 'Create user account for an employee. Sets must_change_password=true.'
        },
        event: [testScript([
          'pm.test("Status is 201 or 403 or 422", () => {',
          '    pm.expect([201, 403, 422]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 201) {',
          '    pm.environment.set("test_user_id", pm.response.json().user.id);',
          '}'
        ])]
      },
      {
        name: '4. Get User',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/users/{{test_user_id}}',
          description: 'Get specific user details.'
        }
      },
      {
        name: '5. Update User Role (PATCH)',
        request: {
          method: 'PATCH',
          header: [],
          body: jsonBody({ role: 'technician' }),
          url: '{{base_url}}/api/users/{{test_user_id}}/role',
          description: 'Update only the role. employee_code and name are read-only.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '6. Update User Role (forbidden: name) → 422',
        request: {
          method: 'PATCH',
          header: [],
          body: jsonBody({ role: 'employee', name: 'Hacked Name' }),
          url: '{{base_url}}/api/users/{{test_user_id}}/role',
          description: 'MUST return 422 - name is not editable.'
        },
        event: [testScript([
          'pm.test("Status is 422", () => pm.response.to.have.status(422));',
          'pm.test("Error mentions name", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.errors).to.have.property("name");',
          '});'
        ])]
      },
      {
        name: '7. Update User Role (forbidden: employee_code) → 422',
        request: {
          method: 'PATCH',
          header: [],
          body: jsonBody({ role: 'employee', employee_code: 'HACK001' }),
          url: '{{base_url}}/api/users/{{test_user_id}}/role',
          description: 'MUST return 422 - employee_code is not editable.'
        },
        event: [testScript([
          'pm.test("Status is 422", () => pm.response.to.have.status(422));',
          'pm.test("Error mentions employee_code", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.errors).to.have.property("employee_code");',
          '});'
        ])]
      },
      {
        name: '8. Delete User',
        request: {
          method: 'DELETE',
          header: [],
          url: '{{base_url}}/api/users/{{test_user_id}}',
          description: 'Delete user account. Cannot delete yourself.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403 or 422", () => {',
          '    pm.expect([200, 403, 422]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '9. RBAC Test: Doctor cannot list users → 403',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/users',
          description: 'Test RBAC: Non-admin roles should get 403. Login as doctor first.'
        },
        event: [testScript([
          '// Run this after logging in as doctor',
          'pm.test("Status is 403 for non-admin", () => {',
          '    pm.response.to.have.status(403);',
          '});',
          'pm.test("Response includes required_roles", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.have.property("required_roles");',
          '    pm.expect(json).to.have.property("your_role");',
          '});'
        ])]
      },
      {
        name: '10. RBAC Test: Technician cannot create user → 403',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            employee_id: 1,
            role: 'employee',
            default_password: 'Password123!'
          }),
          url: '{{base_url}}/api/users',
          description: 'Test RBAC: Non-admin roles should get 403. Login as technician first.'
        },
        event: [testScript([
          '// Run this after logging in as technician',
          'pm.test("Status is 403 for non-admin", () => {',
          '    pm.response.to.have.status(403);',
          '});'
        ])]
      }
    ]
  }
];

// Phase 3 Assets + Assignment + QR endpoints
const phase3Items = [
  // === Assets Section (Admin/HR) ===
  {
    name: 'Assets (Admin/HR)',
    description: 'Asset management. Requires admin or hr role.',
    item: [
      {
        name: '1. List Assets',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/assets?search=&type=&status=&per_page=15',
            host: ['{{base_url}}'],
            path: ['api', 'assets'],
            query: [
              { key: 'search', value: '' },
              { key: 'type', value: '' },
              { key: 'status', value: '' },
              { key: 'per_page', value: '15' }
            ]
          },
          description: 'List assets with optional filtering. Admin/HR see all, others see only assigned.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has assets array", () => {',
          '    pm.expect(pm.response.json()).to.have.property("assets");',
          '});',
          'pm.test("Has available_types", () => {',
          '    pm.expect(pm.response.json()).to.have.property("available_types");',
          '});'
        ])]
      },
      {
        name: '2. Get Available Assets (unassigned)',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/assets/available',
          description: 'Get active assets not currently assigned.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '3. Create Asset',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            asset_code: 'TEST-001',
            name: 'Test Asset',
            type: 'equipment',
            status: 'active',
            notes: 'Created by Postman test'
          }),
          url: '{{base_url}}/api/assets',
          description: 'Create a new asset. Admin/HR only.'
        },
        event: [testScript([
          'pm.test("Status is 201 or 403", () => {',
          '    pm.expect([201, 403]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 201) {',
          '    const json = pm.response.json();',
          '    pm.environment.set("test_asset_id", json.asset.id);',
          '    pm.environment.set("test_qr_payload", json.qr_payload);',
          '    pm.test("Has QR payload", () => {',
          '        pm.expect(json.qr_payload).to.match(/^MESOCO\\|ASSET\\|v1\\|/);',
          '    });',
          '}'
        ])]
      },
      {
        name: '4. Get Asset',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/assets/{{test_asset_id}}',
          description: 'Get specific asset details.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '5. Update Asset',
        request: {
          method: 'PATCH',
          header: [],
          body: jsonBody({
            name: 'Updated Test Asset',
            notes: 'Updated by Postman test'
          }),
          url: '{{base_url}}/api/assets/{{test_asset_id}}',
          description: 'Update asset. Admin/HR only.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '6. Assign Asset to Employee',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            employee_id: '{{test_employee_id_for_assign}}'
          }),
          url: '{{base_url}}/api/assets/{{test_asset_id}}/assign',
          description: 'Assign asset to employee. Only 1 active assignee per asset.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 422 or 403", () => {',
          '    pm.expect([200, 422, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '7. Assign Already Assigned Asset -> 422',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            employee_id: 2
          }),
          url: '{{base_url}}/api/assets/{{test_asset_id}}/assign',
          description: 'Try to assign already assigned asset. Should return 422 with ALREADY_ASSIGNED error.'
        },
        event: [testScript([
          'pm.test("Status is 422 (already assigned)", () => {',
          '    pm.response.to.have.status(422);',
          '});',
          'pm.test("Error is ALREADY_ASSIGNED", () => {',
          '    pm.expect(pm.response.json().error).to.equal("ALREADY_ASSIGNED");',
          '});'
        ])]
      },
      {
        name: '8. Unassign Asset',
        request: {
          method: 'POST',
          header: [],
          url: '{{base_url}}/api/assets/{{test_asset_id}}/unassign',
          description: 'Unassign asset from current employee.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 422 or 403", () => {',
          '    pm.expect([200, 422, 403]).to.include(pm.response.code);',
          '});'
        ])]
      },
      {
        name: '9. Regenerate QR Code',
        request: {
          method: 'POST',
          header: [],
          url: '{{base_url}}/api/assets/{{test_asset_id}}/regenerate-qr',
          description: 'Generate new QR identity for asset. Old QR becomes invalid.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 200) {',
          '    const json = pm.response.json();',
          '    pm.environment.set("test_qr_payload", json.qr_payload);',
          '}'
        ])]
      },
      {
        name: '10. Delete Asset',
        request: {
          method: 'DELETE',
          header: [],
          url: '{{base_url}}/api/assets/{{test_asset_id}}',
          description: 'Delete asset. Cannot delete if currently assigned.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 422 or 403", () => {',
          '    pm.expect([200, 422, 403]).to.include(pm.response.code);',
          '});'
        ])]
      }
    ]
  },
  // === QR Resolve Section ===
  {
    name: 'QR Resolve',
    description: 'QR code resolution. All authenticated users can resolve QR codes.',
    item: [
      {
        name: '1. Resolve QR Code (valid)',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            payload: '{{existing_qr_payload}}'
          }),
          url: '{{base_url}}/api/qr/resolve',
          description: 'Resolve QR payload to get asset and assignee info.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has asset info", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.have.property("asset");',
          '    pm.expect(json.asset).to.have.property("asset_code");',
          '});',
          'pm.test("Has is_assigned flag", () => {',
          '    pm.expect(pm.response.json()).to.have.property("is_assigned");',
          '});'
        ])]
      },
      {
        name: '2. Resolve QR Code (invalid format) -> 422',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            payload: 'INVALID|FORMAT'
          }),
          url: '{{base_url}}/api/qr/resolve',
          description: 'Invalid QR format should return 422.'
        },
        event: [testScript([
          'pm.test("Status is 422", () => pm.response.to.have.status(422));',
          'pm.test("Error is INVALID_QR_FORMAT", () => {',
          '    pm.expect(pm.response.json().error).to.equal("INVALID_QR_FORMAT");',
          '});'
        ])]
      },
      {
        name: '3. Resolve QR Code (not found) -> 404',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            payload: 'MESOCO|ASSET|v1|00000000-0000-0000-0000-000000000000'
          }),
          url: '{{base_url}}/api/qr/resolve',
          description: 'Non-existent QR should return 404.'
        },
        event: [testScript([
          'pm.test("Status is 404", () => pm.response.to.have.status(404));',
          'pm.test("Error is QR_NOT_FOUND", () => {',
          '    pm.expect(pm.response.json().error).to.equal("QR_NOT_FOUND");',
          '});'
        ])]
      }
    ]
  },
  // === RBAC Tests ===
  {
    name: 'RBAC Tests (Non-Admin)',
    description: 'Test that non-admin users cannot manage assets.',
    item: [
      {
        name: '1. Doctor can view own assigned assets',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/my-assets',
          description: 'Login as doctor first. Should see only assigned assets.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has assets array", () => {',
          '    pm.expect(pm.response.json()).to.have.property("assets");',
          '});'
        ])]
      },
      {
        name: '2. Doctor cannot create asset -> 403',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            asset_code: 'HACK-001',
            name: 'Hacked Asset',
            type: 'tray'
          }),
          url: '{{base_url}}/api/assets',
          description: 'Login as doctor first. Should get 403.'
        },
        event: [testScript([
          'pm.test("Status is 403", () => pm.response.to.have.status(403));'
        ])]
      },
      {
        name: '3. Doctor cannot assign asset -> 403',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({ employee_id: 1 }),
          url: '{{base_url}}/api/assets/1/assign',
          description: 'Login as doctor first. Should get 403.'
        },
        event: [testScript([
          'pm.test("Status is 403", () => pm.response.to.have.status(403));'
        ])]
      },
      {
        name: '4. Doctor can resolve QR -> 200',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            payload: '{{existing_qr_payload}}'
          }),
          url: '{{base_url}}/api/qr/resolve',
          description: 'Login as doctor first. All users can resolve QR.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 404", () => {',
          '    pm.expect([200, 404]).to.include(pm.response.code);',
          '});'
        ])]
      }
    ]
  }
];

// Phase 4 Asset Tracking (Timesheet / Check-in)
const phase4Items = [
  // === Shifts Section ===
  {
    name: 'Shifts',
    description: 'View available shifts. All authenticated users.',
    item: [
      {
        name: '1. List Shifts',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/api/shifts',
          description: 'List all active shifts with current shift indicator.'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has data array and current_shift", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.have.property("data");',
          '    pm.expect(json).to.have.property("current_shift");',
          '});'
        ])]
      }
    ]
  },
  // === Check-ins Section ===
  {
    name: 'Check-ins',
    description: 'Asset check-in/check-out. All authenticated users can check-in their assigned assets.',
    item: [
      {
        name: '1. Check-in Asset',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            asset_id: '{{test_asset_id}}'
          }),
          url: '{{base_url}}/api/checkins',
          description: 'Check-in an assigned asset. Auto-detects current shift if not specified.'
        },
        event: [testScript([
          'pm.test("Status is 201 or 403/409", () => {',
          '    pm.expect([201, 403, 409]).to.include(pm.response.code);',
          '});',
          'if (pm.response.code === 201) {',
          '    const json = pm.response.json();',
          '    pm.environment.set("test_checkin_id", json.data.id);',
          '}'
        ])]
      },
      {
        name: '2. My Check-ins',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/my-checkins?date=',
            host: ['{{base_url}}'],
            path: ['api', 'my-checkins'],
            query: [
              { key: 'date', value: '' }
            ]
          },
          description: 'Get own check-ins. Optional date filter (YYYY-MM-DD).'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has checkins array", () => {',
          '    pm.expect(pm.response.json()).to.have.property("checkins");',
          '});'
        ])]
      },
      {
        name: '3. Check-out',
        request: {
          method: 'PATCH',
          header: [],
          url: '{{base_url}}/api/checkins/{{test_checkin_id}}/checkout',
          description: 'Check-out from a check-in.'
        },
        event: [testScript([
          'pm.test("Status is 200 or 403", () => {',
          '    pm.expect([200, 403]).to.include(pm.response.code);',
          '});'
        ])]
      }
    ]
  },
  // === QR Resolve with Check-in ===
  {
    name: 'QR Resolve with Check-in',
    description: 'QR resolve now includes check-in actions',
    item: [
      {
        name: '1. QR Resolve (shows check-in actions)',
        request: {
          method: 'POST',
          header: [],
          body: jsonBody({
            payload: '{{existing_qr_payload}}'
          }),
          url: '{{base_url}}/api/qr/resolve',
          description: 'QR resolve now returns check-in status and available actions'
        },
        event: [testScript([
          'pm.test("Status is 200", () => pm.response.to.have.status(200));',
          'pm.test("Has checkin_status", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.have.property("checkin_status");',
          '    pm.expect(json.checkin_status).to.have.property("can_check_in");',
          '});',
          'pm.test("Has instructions object", () => {',
          '    const json = pm.response.json();',
          '    pm.expect(json.asset).to.have.property("instructions");',
          '    pm.expect(json.asset.instructions).to.have.property("available");',
          '    pm.expect(json.asset.instructions).to.have.property("type");',
          '    pm.expect(json.asset.instructions).to.have.property("url");',
          '});',
          'pm.test("Has actions array", () => {',
          '    pm.expect(pm.response.json()).to.have.property("actions");',
          '});'
        ])]
      }
    ]
  }
];

function generateCollection() {
  console.log('🔧 Generating Postman collection...\n');

  const collection = JSON.parse(JSON.stringify(collectionTemplate));

  // Add Phase 1
  collection.item.push({
    name: 'PHASE 1 - Auth',
    description: 'Authentication endpoints: Login, Logout, Forgot Password, Change Password',
    item: phase1Items.map(item => ({ ...item, response: [] }))
  });

  // Add Phase 2
  collection.item.push({
    name: 'PHASE 2 - RBAC + Profile',
    description: 'Profile management, Employee CRUD (Admin/HR), User/Roles management (Admin/HR).\n\nTest roles: admin, hr, doctor, technician, employee.\n\n**RBAC Tests:**\n- 403 tests prove backend-enforced authorization\n- 422 tests prove immutable fields are rejected',
    item: phase2Items.map(item => {
      if (item.item) {
        return {
          ...item,
          item: item.item.map(subItem => ({ ...subItem, response: [] }))
        };
      }
      return { ...item, response: [] };
    })
  });

  // Add Phase 3
  collection.item.push({
    name: 'PHASE 3 - Assets + Assignment + QR',
    description: 'Asset management, Assignment workflow, QR code resolution.\n\n**Asset Types:** tray, machine, tool, equipment, other\n**Asset Statuses:** active, off_service, maintenance, retired\n\n**QR Format v1:** MESOCO|ASSET|v1|<uuid>\n\n**RBAC:**\n- Admin/HR: full CRUD + assign/unassign\n- Others: view assigned assets + resolve QR',
    item: phase3Items.map(item => {
      if (item.item) {
        return {
          ...item,
          item: item.item.map(subItem => ({ ...subItem, response: [] }))
        };
      }
      return { ...item, response: [] };
    })
  });

  // Add Phase 4
  collection.item.push({
    name: 'PHASE 4 - Asset Tracking (Timesheet)',
    description: 'Asset check-in/check-out, Shift management.\n\n**Shifts:** Morning (06-12), Afternoon (12-18), Evening (18-22)\n\n**Check-in Rules:**\n- Only assignee or admin can check-in\n- One check-in per asset per shift per day\n- Off-service assets cannot be checked in\n\n**Instructions:**\n- Assets can have instructions_url (URL to documentation)\n- QR resolve returns instructions object',
    item: phase4Items.map(item => {
      if (item.item) {
        return {
          ...item,
          item: item.item.map(subItem => ({ ...subItem, response: [] }))
        };
      }
      return { ...item, response: [] };
    })
  });

  // Check for additional phase files
  if (existsSync(PHASES_DIR)) {
    const phaseFiles = readdirSync(PHASES_DIR)
      .filter(f => f.match(/^PHASE\d+_.*\.md$/i) && !f.includes('PHASE1') && !f.includes('PHASE2') && !f.includes('PHASE3'))
      .sort();

    if (phaseFiles.length > 0) {
      console.log('📂 Found additional phase files:');
      phaseFiles.forEach(f => console.log(`   - ${f}`));
      console.log('\n⚠️  Note: Additional phases need manual implementation in this script.\n');
    }
  }

  // Write output
  writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 2));
  console.log(`✅ Generated: ${OUTPUT_FILE}\n`);

  // Summary
  const totalRequests = collection.item.reduce((sum, phase) => {
    if (phase.item) {
      return sum + phase.item.reduce((subSum, item) => {
        if (item.item) {
          return subSum + item.item.length;
        }
        return subSum + 1;
      }, 0);
    }
    return sum;
  }, 0);

  console.log('📊 Collection Summary:');
  console.log(`   - Phases: ${collection.item.length}`);
  console.log(`   - Total requests: ${totalRequests}`);
  console.log('\n📝 Import Instructions:');
  console.log('   1. Open Postman');
  console.log('   2. Click "Import" button');
  console.log('   3. Select postman/mesoco.postman_collection.json');
  console.log('   4. Go to Environments tab');
  console.log('   5. Import postman/mesoco.local.postman_environment.json');
  console.log('   6. Select "Mesoco — Local" from environment dropdown');
  console.log('   7. Start testing!\n');
  
  console.log('🧪 Phase 2 Testing Tips:');
  console.log('   - Login as admin (E0001) to test admin endpoints');
  console.log('   - Login as doctor (E0003) to test 403 responses');
  console.log('   - Test forbidden fields (employee_code, email) for 422 responses');
  console.log('   - Available employees for user creation: E0006, E0007\n');
  
  console.log('🧪 Phase 3 Testing Tips:');
  console.log('   - Test assets: TRAY-001 (assigned to doctor), MACH-002 (assigned to tech)');
  console.log('   - Unassigned assets: TRAY-002, TRAY-003, MACH-001, EQUIP-001');
  console.log('   - QR format: MESOCO|ASSET|v1|<uuid>');
  console.log('   - Test assignment uniqueness: try assigning already-assigned asset\n');
  
  console.log('🧪 Phase 4 Testing Tips:');
  console.log('   - Check-in requires assigned asset + active shift');
  console.log('   - TRAY-001 has instructions_url, TRAY-002 does not');
  console.log('   - Shifts: Morning (S1), Afternoon (S2), Evening (S3)');
  console.log('   - Cannot check-in off_service asset (EQUIP-003)\n');
}

// Run
generateCollection();
