<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\MaintenanceEvent;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\RequestEvent;
use App\Models\RequestItem;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Phase 5: Justification + Asset Request + Review.
 */
class RequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $hrUser;
    protected User $employeeUser;
    protected User $employeeUser2;
    protected Employee $employee;
    protected Employee $employee2;
    protected Asset $asset;
    protected Asset $unassignedAsset;
    protected Shift $shift;

    protected function setUp(): void
    {
        parent::setUp();

        // Create shifts
        $this->shift = Shift::create([
            'code' => 'S1',
            'name' => 'Morning',
            'start_time' => '08:00:00',
            'end_time' => '12:00:00',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // Create admin
        $adminEmployee = Employee::factory()->create([
            'employee_code' => 'ADMIN01',
            'full_name' => 'Admin User',
        ]);
        $this->adminUser = User::factory()->create([
            'employee_id' => $adminEmployee->id,
            'role' => 'admin',
            'must_change_password' => false,
        ]);

        // Create technician user (legacy HR alias)
        $hrEmployee = Employee::factory()->create([
            'employee_code' => 'HR001',
            'full_name' => 'Technician User',
        ]);
        $this->hrUser = User::factory()->create([
            'employee_id' => $hrEmployee->id,
            'role' => 'hr',
            'must_change_password' => false,
        ]);

        // Create regular employee 1
        $this->employee = Employee::factory()->create([
            'employee_code' => 'EMP001',
            'full_name' => 'Test Employee',
        ]);
        $this->employeeUser = User::factory()->create([
            'employee_id' => $this->employee->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        // Create regular employee 2 (for IDOR tests)
        $this->employee2 = Employee::factory()->create([
            'employee_code' => 'EMP002',
            'full_name' => 'Another Employee',
        ]);
        $this->employeeUser2 = User::factory()->create([
            'employee_id' => $this->employee2->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        // Create asset (assigned to employee - for JUSTIFICATION tests)
        $this->asset = Asset::create([
            'asset_code' => 'TEST-001',
            'name' => 'Test Equipment',
            'type' => 'equipment',
            'status' => 'active',
        ]);

        AssetAssignment::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employee->id,
            'assigned_by' => $this->adminUser->id,
            'assigned_at' => now(),
        ]);

        // Create unassigned asset (for ASSET_LOAN tests)
        $this->unassignedAsset = Asset::create([
            'asset_code' => 'TEST-002',
            'name' => 'Loanable Equipment',
            'type' => 'equipment',
            'status' => 'active',
        ]);
    }

    // ========================================
    // POST /api/requests - Create Request
    // ========================================

    public function test_employee_can_create_justification_request(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/requests', [
                'type' => 'JUSTIFICATION',
                'title' => 'Equipment Malfunction',
                'description' => 'The equipment stopped working during operation.',
                'severity' => 'high',
                'incident_at' => now()->subHour()->toISOString(),
                'suspected_cause' => 'wear',
                'items' => [
                    [
                        'item_kind' => 'ASSET',
                        'asset_id' => $this->asset->id,
                        'note' => 'Unusual noise before failure',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('request.type', 'JUSTIFICATION')
            ->assertJsonPath('request.status', 'SUBMITTED')
            ->assertJsonPath('request.severity', 'high')
            ->assertJsonPath('request.is_final', false)
            ->assertJsonPath('request.can_be_cancelled', true);

        // Verify the code format
        $this->assertMatchesRegularExpression('/^REQ-\d{6}-\d{4}$/', $response->json('request.code'));

        // Verify event was logged
        $this->assertDatabaseHas('request_events', [
            'event_type' => 'CREATED',
        ]);
    }

    public function test_employee_can_create_consumable_request(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/requests', [
                'type' => 'CONSUMABLE_REQUEST',
                'title' => 'Request for dental supplies',
                'description' => 'Need more supplies for next week.',
                'items' => [
                    [
                        'item_kind' => 'CONSUMABLE',
                        'sku' => 'SKU-001',
                        'name' => 'Dental Gloves',
                        'qty' => 100,
                        'unit' => 'pairs',
                    ],
                    [
                        'item_kind' => 'CONSUMABLE',
                        'name' => 'Face Masks',
                        'qty' => 50,
                        'unit' => 'pcs',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('request.type', 'CONSUMABLE_REQUEST')
            ->assertJsonPath('request.status', 'SUBMITTED');

        // Verify items were created
        $this->assertCount(2, $response->json('request.items'));
    }

    public function test_employee_can_create_asset_loan_request(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/requests', [
                'type' => 'ASSET_LOAN',
                'title' => 'Borrow equipment for procedure',
                'items' => [
                    [
                        'item_kind' => 'ASSET',
                        'asset_id' => $this->unassignedAsset->id,
                        'from_shift_id' => $this->shift->id,
                        'to_shift_id' => $this->shift->id,
                        'from_date' => now()->addDay()->toDateString(),
                        'to_date' => now()->addDay()->toDateString(),
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('request.type', 'ASSET_LOAN');
    }

    public function test_create_request_fails_without_employee_record(): void
    {
        $userWithoutEmployee = User::factory()->create([
            'employee_id' => null,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($userWithoutEmployee)
            ->postJson('/api/requests', [
                'type' => 'JUSTIFICATION',
                'title' => 'Test',
                'severity' => 'low',
                'items' => [
                    ['item_kind' => 'ASSET', 'asset_id' => $this->asset->id],
                ],
            ]);

        $response->assertForbidden();
    }

    public function test_justification_requires_severity(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/requests', [
                'type' => 'JUSTIFICATION',
                'title' => 'Test',
                // Missing severity
                'items' => [
                    ['item_kind' => 'ASSET', 'asset_id' => $this->asset->id],
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['severity']);
    }

    public function test_consumable_request_requires_qty(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/requests', [
                'type' => 'CONSUMABLE_REQUEST',
                'title' => 'Test',
                'items' => [
                    [
                        'item_kind' => 'CONSUMABLE',
                        'name' => 'Test Item',
                        // Missing qty
                    ],
                ],
            ]);

        $response->assertUnprocessable();
    }

    // ========================================
    // GET /api/requests - List Own Requests
    // ========================================

    public function test_employee_can_list_own_requests(): void
    {
        // Create request for employee 1
        $request1 = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'My Request',
            'severity' => 'low',
        ]);

        // Create request for employee 2
        $request2 = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee2->id,
            'title' => 'Other Request',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/requests?mine=1');

        $response->assertOk()
            ->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.title', 'My Request');
    }

    public function test_employee_sees_only_own_requests_by_default(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'My Request',
            'severity' => 'low',
        ]);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee2->id,
            'title' => 'Other Request',
            'severity' => 'low',
        ]);

        // Even without mine=1, non-admin should only see own requests
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(1, 'requests');
    }

    public function test_admin_can_list_all_requests(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Request 1',
            'severity' => 'low',
        ]);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee2->id,
            'title' => 'Request 2',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(2, 'requests');
    }

    public function test_can_filter_requests_by_type_and_status(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Justification',
            'severity' => 'low',
        ]);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'CONSUMABLE_REQUEST',
            'status' => 'APPROVED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Consumable',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/requests?type=JUSTIFICATION&status=SUBMITTED');

        $response->assertOk()
            ->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.type', 'JUSTIFICATION');
    }

    // ========================================
    // GET /api/requests/{id} - View Request (IDOR Protection)
    // ========================================

    public function test_employee_can_view_own_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'My Request',
            'severity' => 'high',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson("/api/requests/{$request->id}");

        $response->assertOk()
            ->assertJsonPath('request.title', 'My Request');
    }

    public function test_employee_cannot_view_others_request_idor_protection(): void
    {
        $otherRequest = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee2->id,
            'title' => 'Other Request',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson("/api/requests/{$otherRequest->id}");

        $response->assertForbidden()
            ->assertJson(['message' => 'You are not authorized to view this request.']);
    }

    public function test_admin_can_view_any_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Employee Request',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/requests/{$request->id}");

        $response->assertOk()
            ->assertJsonPath('request.title', 'Employee Request');
    }

    // ========================================
    // POST /api/requests/{id}/cancel
    // ========================================

    public function test_employee_can_cancel_own_submitted_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'To Cancel',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->postJson("/api/requests/{$request->id}/cancel");

        $response->assertOk()
            ->assertJsonPath('request.status', 'CANCELLED');

        $this->assertDatabaseHas('request_events', [
            'request_id' => $request->id,
            'event_type' => 'CANCELLED',
        ]);
    }

    public function test_employee_cannot_cancel_others_request(): void
    {
        $otherRequest = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee2->id,
            'title' => 'Other Request',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->postJson("/api/requests/{$otherRequest->id}/cancel");

        $response->assertForbidden();
    }

    public function test_cannot_cancel_already_approved_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'APPROVED',
            'requested_by_employee_id' => $this->employee->id,
            'reviewed_by_user_id' => $this->adminUser->id,
            'reviewed_at' => now(),
            'title' => 'Approved',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->postJson("/api/requests/{$request->id}/cancel");

        $response->assertStatus(422)
            ->assertJson(['message' => 'This request cannot be cancelled in its current status.']);
    }

    // ========================================
    // GET /api/review-requests - Review Queue
    // ========================================

    public function test_admin_can_view_review_queue(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Pending Review',
            'severity' => 'high',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/review-requests');

        $response->assertOk()
            ->assertJsonCount(1, 'requests');
    }

    public function test_technician_cannot_view_review_queue(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Pending Review',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->hrUser)
            ->getJson('/api/review-requests');

        $response->assertForbidden();
    }

    public function test_employee_cannot_view_review_queue(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/review-requests');

        $response->assertForbidden();
    }

    public function test_review_queue_defaults_to_submitted_status(): void
    {
        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Submitted',
            'severity' => 'low',
        ]);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'APPROVED',
            'requested_by_employee_id' => $this->employee2->id,
            'reviewed_by_user_id' => $this->adminUser->id,
            'reviewed_at' => now(),
            'title' => 'Already Approved',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/review-requests');

        $response->assertOk()
            ->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.status', 'SUBMITTED');
    }

    // ========================================
    // POST /api/requests/{id}/review - Approve/Reject
    // ========================================

    public function test_admin_can_approve_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'asset_id' => $this->asset->id,
            'title' => 'To Approve',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'APPROVE',
                'note' => 'Looks good, approved.',
                'assigned_to_user_id' => $this->hrUser->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('request.status', 'APPROVED')
            ->assertJsonPath('request.review_note', 'Looks good, approved.')
            ->assertJsonPath('request.assigned_to.id', $this->hrUser->id)
            ->assertJsonPath('maintenance_event.type', MaintenanceEvent::TYPE_REPAIR)
            ->assertJsonPath('request.is_final', true);

        $this->assertDatabaseHas('request_events', [
            'request_id' => $request->id,
            'event_type' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('request_events', [
            'request_id' => $request->id,
            'event_type' => 'DISPATCHED',
        ]);

        $this->assertDatabaseHas('maintenance_events', [
            'asset_id' => $this->asset->id,
            'type' => MaintenanceEvent::TYPE_REPAIR,
            'assigned_to_user_id' => $this->hrUser->id,
        ]);
    }

    public function test_justification_review_requires_technician_assignment(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'asset_id' => $this->asset->id,
            'title' => 'Missing Technician',
            'severity' => 'high',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'APPROVE',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['assigned_to_user_id']);
    }

    public function test_admin_can_reject_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'To Reject',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'REJECT',
                'note' => 'Insufficient information.',
            ]);

        $response->assertOk()
            ->assertJsonPath('request.status', 'REJECTED')
            ->assertJsonPath('request.is_final', true);

        $this->assertDatabaseHas('request_events', [
            'request_id' => $request->id,
            'event_type' => 'REJECTED',
        ]);
    }

    public function test_employee_cannot_review_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'APPROVE',
            ]);

        $response->assertForbidden();
    }

    public function test_cannot_review_already_finalized_request(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'REJECTED',
            'requested_by_employee_id' => $this->employee->id,
            'reviewed_by_user_id' => $this->adminUser->id,
            'reviewed_at' => now(),
            'title' => 'Already Rejected',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'APPROVE',
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'This request cannot be reviewed in its current status.']);
    }

    public function test_review_requires_valid_action(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/requests/{$request->id}/review", [
                'action' => 'INVALID',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['action']);
    }

    // ========================================
    // Status Transition Tests
    // ========================================

    public function test_request_status_transitions(): void
    {
        // Create SUBMITTED request
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        $this->assertTrue($request->canBeCancelled());
        $this->assertTrue($request->canBeReviewed());
        $this->assertFalse($request->isFinal());

        // Approve the request
        $request->approve($this->adminUser, 'Approved');
        $request->refresh();

        $this->assertFalse($request->canBeCancelled());
        $this->assertFalse($request->canBeReviewed());
        $this->assertTrue($request->isFinal());
        $this->assertEquals('APPROVED', $request->status);
    }

    public function test_cancelled_request_is_final(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        $request->cancel($this->employeeUser);
        $request->refresh();

        $this->assertTrue($request->isFinal());
        $this->assertFalse($request->canBeCancelled());
        $this->assertFalse($request->canBeReviewed());
    }

    // ========================================
    // Policy Unit Tests
    // ========================================

    public function test_policy_isRequester_check(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        // Owner should be able to view
        $this->assertTrue($this->employeeUser->can('view', $request));
        
        // Non-owner should not be able to view
        $this->assertFalse($this->employeeUser2->can('view', $request));
        
        // Admin should be able to view any
        $this->assertTrue($this->adminUser->can('view', $request));
    }

    public function test_policy_cancel_permission(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        // Owner can cancel SUBMITTED
        $this->assertTrue($this->employeeUser->can('cancel', $request));
        
        // Non-owner cannot cancel
        $this->assertFalse($this->employeeUser2->can('cancel', $request));
        
        // Admin cannot cancel (only requester can)
        $this->assertFalse($this->adminUser->can('cancel', $request));
    }

    public function test_policy_review_permission(): void
    {
        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test',
            'severity' => 'low',
        ]);

        // Admin can review
        $this->assertTrue($this->adminUser->can('review', $request));
        
        // Technician cannot review
        $this->assertFalse($this->hrUser->can('review', $request));
        
        // Employee cannot review
        $this->assertFalse($this->employeeUser->can('review', $request));
    }

    // ========================================
    // Code Generation Tests
    // ========================================

    public function test_request_code_generation(): void
    {
        $code1 = AssetRequest::generateCode();
        $this->assertMatchesRegularExpression('/^REQ-\d{6}-0001$/', $code1);

        AssetRequest::create([
            'code' => $code1,
            'type' => 'JUSTIFICATION',
            'status' => 'SUBMITTED',
            'requested_by_employee_id' => $this->employee->id,
            'title' => 'Test 1',
            'severity' => 'low',
        ]);

        $code2 = AssetRequest::generateCode();
        $this->assertMatchesRegularExpression('/^REQ-\d{6}-0002$/', $code2);
    }
}
