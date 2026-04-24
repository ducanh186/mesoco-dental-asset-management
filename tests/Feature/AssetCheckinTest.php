<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Phase 4: Asset Tracking (Timesheet / Check-in).
 */
class AssetCheckinTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $employeeUser;
    protected Employee $employee;
    protected Asset $asset;
    protected Shift $shift;

    protected function setUp(): void
    {
        parent::setUp();

        // Create shifts
        $this->shift = Shift::create([
            'code' => 'S1',
            'name' => 'Morning',
            'start_time' => '00:00:00', // Use wide time range for testing
            'end_time' => '23:59:59',
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

        // Create regular employee
        $this->employee = Employee::factory()->create([
            'employee_code' => 'EMP001',
            'full_name' => 'Test Employee',
        ]);
        $this->employeeUser = User::factory()->create([
            'employee_id' => $this->employee->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        // Create asset and assign to employee
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
    }

    // ========================================
    // GET /api/shifts
    // ========================================

    public function test_authenticated_user_can_list_shifts(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/shifts');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'name', 'start_time', 'end_time', 'time_range'],
                ],
                'current_shift',
            ]);
    }

    public function test_unauthenticated_user_cannot_list_shifts(): void
    {
        $response = $this->getJson('/api/shifts');

        $response->assertUnauthorized();
    }

    // ========================================
    // POST /api/checkins
    // ========================================

    public function test_assignee_can_check_in_asset(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
                'source' => 'manual',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'asset_id', 'employee_id', 'shift_id', 'shift_date', 'checked_in_at'],
            ]);

        $this->assertDatabaseHas('asset_checkins', [
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'source' => 'manual',
        ]);
    }

    public function test_admin_can_check_in_any_asset(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
                'source' => 'manual',
            ]);

        $response->assertCreated();
    }

    public function test_non_assignee_cannot_check_in_asset(): void
    {
        // Create another employee who is not the assignee
        $otherEmployee = Employee::factory()->create();
        $otherUser = User::factory()->create([
            'employee_id' => $otherEmployee->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($otherUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
            ]);

        $response->assertForbidden()
            ->assertJson([
                'error' => 'NOT_ASSIGNEE',
            ]);
    }

    public function test_cannot_check_in_off_service_asset(): void
    {
        $this->asset->update(['status' => 'off_service']);

        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'ASSET_LOCKED',
            ]);
    }

    public function test_cannot_duplicate_checkin_same_shift_same_day(): void
    {
        // First check-in
        $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
            ])
            ->assertCreated();

        // Try duplicate
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'error_code' => 'DUPLICATE_CHECKIN',
            ]);
    }

    public function test_checkin_auto_detects_current_shift(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.shift_id', $this->shift->id);
    }

    public function test_checkin_can_specify_shift(): void
    {
        $afternoonShift = Shift::create([
            'code' => 'S2',
            'name' => 'Afternoon',
            'start_time' => '13:00:00',
            'end_time' => '17:00:00',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
                'shift_id' => $afternoonShift->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.shift_id', $afternoonShift->id);
    }

    // ========================================
    // PATCH /api/checkins/{id}/checkout
    // ========================================

    public function test_user_can_checkout_own_checkin(): void
    {
        $checkin = AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
            'source' => 'manual',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->patchJson("/api/checkins/{$checkin->id}/checkout");

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => ['checked_out_at'],
            ]);

        $this->assertNotNull($checkin->fresh()->checked_out_at);
    }

    public function test_admin_can_checkout_any_checkin(): void
    {
        $checkin = AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
            'source' => 'manual',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patchJson("/api/checkins/{$checkin->id}/checkout");

        $response->assertOk();
    }

    public function test_cannot_checkout_already_checked_out(): void
    {
        $checkin = AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now()->subHour(),
            'checked_out_at' => now(),
            'source' => 'manual',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->patchJson("/api/checkins/{$checkin->id}/checkout");

        $response->assertForbidden()
            ->assertJson([
                'error_code' => 'ALREADY_CHECKED_OUT',
            ]);
    }

    // ========================================
    // GET /api/my-checkins
    // ========================================

    public function test_user_can_get_own_checkins(): void
    {
        AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
            'source' => 'manual',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/my-checkins');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_filter_checkins_by_date(): void
    {
        // Today's check-in
        AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
            'source' => 'manual',
        ]);

        // Yesterday's check-in
        AssetCheckin::create([
            'asset_id' => $this->asset->id,
            'employee_id' => $this->employeeUser->employee_id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->subDay()->toDateString(),
            'checked_in_at' => now()->subDay(),
            'source' => 'manual',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/my-checkins?date=' . now()->toDateString());

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ========================================
    // GET /api/assets/{asset}/checkin-status
    // ========================================

    public function test_can_get_asset_checkin_status(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson("/api/assets/{$this->asset->id}/checkin-status");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'asset_id',
                    'date',
                    'current_shift',
                    'current_checkin',
                    'today_checkins',
                ],
            ]);
    }

    // ========================================
    // QR and legacy my-assets routes
    // ========================================

    public function test_qr_resolve_route_returns_gone(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->postJson('/api/qr/resolve', [
                'payload' => 'MESOCO|ASSET|v1|legacy',
            ]);

        $response->assertStatus(410);
    }

    public function test_my_assets_route_returns_gone(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/my-assets');

        $response->assertStatus(410);
    }

    public function test_my_assets_with_checkin_status_route_returns_gone(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/my-assets?include_checkin_status=true');

        $response->assertStatus(410);
    }
}
