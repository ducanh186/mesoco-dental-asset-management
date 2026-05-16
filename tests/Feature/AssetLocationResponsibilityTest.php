<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Assignment;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLocationResponsibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_location_accepts_optional_code_but_rejects_duplicate_codes(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);

        $this->actingAs($manager)
            ->postJson('/api/locations', [
                'name' => 'Kho IT',
                'description' => 'Kho thiết bị IT',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Kho IT')
            ->assertJsonPath('data.code', null);

        Location::factory()->create([
            'code' => 'LOC-001',
            'name' => 'Kho IT 1',
        ]);

        $this->actingAs($manager)
            ->postJson('/api/locations', [
                'code' => 'LOC-001',
                'name' => 'Kho IT 2',
                'description' => 'Trùng mã vị trí',
                'is_active' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_asset_response_returns_structured_location_and_responsible_employee(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $location = Location::factory()->create([
            'code' => 'LOC-IT',
            'name' => 'Kho IT',
            'description' => 'Kho thiết bị IT',
        ]);
        $employee = Employee::factory()->create([
            'employee_code' => 'EMP001',
            'full_name' => 'Nguyen Van A',
            'position' => 'IT Support',
        ]);
        $staffUser = User::factory()->employee()->create([
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'username' => 'nguyen.van.a',
            'name' => $employee->full_name,
            'full_name' => $employee->full_name,
            'must_change_password' => false,
        ]);
        $asset = Asset::factory()->create([
            'asset_code' => 'IT-LAP-001',
            'name' => 'Dell Latitude',
            'status' => Asset::STATUS_ACTIVE,
            'location_id' => $location->id,
            'location' => 'Legacy text',
        ]);

        AssetAssignment::factory()->create([
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'department_name' => null,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
            'unassigned_at' => null,
        ]);

        $this->actingAs($manager)
            ->getJson("/api/assets/{$asset->id}")
            ->assertOk()
            ->assertJsonPath('asset.location.id', $location->id)
            ->assertJsonPath('asset.location.code', 'LOC-IT')
            ->assertJsonPath('asset.location.name', 'Kho IT')
            ->assertJsonPath('asset.location.description', 'Kho thiết bị IT')
            ->assertJsonPath('asset.responsible_employee.id', $employee->id)
            ->assertJsonPath('asset.responsible_employee.employee_code', 'EMP001')
            ->assertJsonPath('asset.responsible_employee.full_name', 'Nguyen Van A')
            ->assertJsonPath('asset.responsible_employee.user.id', $staffUser->id)
            ->assertJsonPath('asset.responsible_employee.user.username', 'nguyen.van.a')
            ->assertJsonPath('asset.responsible_employee.position', 'IT Support');
    }

    public function test_employee_index_includes_linked_user_metadata_for_handover_dropdown(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create([
            'employee_code' => 'EMP-HANDOVER-001',
            'full_name' => 'Nhan Vien Handover',
            'status' => 'active',
        ]);
        $staffUser = User::factory()->employee()->create([
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'username' => 'handover.staff',
            'name' => $employee->full_name,
            'full_name' => $employee->full_name,
            'must_change_password' => false,
        ]);

        $this->actingAs($manager)
            ->getJson('/api/employees?per_page=100&status=active')
            ->assertOk()
            ->assertJsonPath('employees.0.id', $employee->id)
            ->assertJsonPath('employees.0.user.id', $staffUser->id)
            ->assertJsonPath('employees.0.user.username', 'handover.staff');
    }

    public function test_assign_asset_requires_employee_not_department_only(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create(['status' => Asset::STATUS_ACTIVE]);

        $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/assign", [
                'department_name' => 'IT',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['employee_id']);
    }

    public function test_available_assets_route_returns_only_active_unassigned_assets(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();
        $available = Asset::factory()->create([
            'asset_code' => 'IT-AVL-001',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $assigned = Asset::factory()->create([
            'asset_code' => 'IT-AVL-002',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $maintenance = Asset::factory()->create([
            'asset_code' => 'IT-AVL-003',
            'status' => Asset::STATUS_MAINTENANCE,
        ]);
        $retired = Asset::factory()->create([
            'asset_code' => 'IT-AVL-004',
            'status' => Asset::STATUS_RETIRED,
        ]);

        AssetAssignment::factory()->create([
            'asset_id' => $assigned->id,
            'employee_id' => $employee->id,
            'assigned_by' => $manager->id,
            'unassigned_at' => null,
        ]);

        $response = $this->actingAs($manager)
            ->getJson('/api/assets/available')
            ->assertOk();

        $ids = collect($response->json('assets'))->pluck('id');

        $this->assertTrue($ids->contains($available->id));
        $this->assertFalse($ids->contains($assigned->id));
        $this->assertFalse($ids->contains($maintenance->id));
        $this->assertFalse($ids->contains($retired->id));
    }

    public function test_manager_can_assign_and_unassign_asset_directly(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create([
            'employee_code' => 'EMP-HAND-001',
            'full_name' => 'Nhan Vien Nhan Tai San',
        ]);
        $asset = Asset::factory()->create([
            'asset_code' => 'IT-HAND-001',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/assign", [
                'employee_id' => $employee->id,
            ])
            ->assertOk()
            ->assertJsonPath('assignment.employee_id', $employee->id)
            ->assertJsonPath('assignment.assigned_by', $manager->id);

        $staffUserId = User::where('employee_id', $employee->id)->value('id');

        $this->assertNotNull($staffUserId);
        $response->assertJsonPath('assignment.staff_id', $staffUserId);

        $this->assertDatabaseHas('assignments', [
            'staff_id' => $staffUserId,
            'admin_id' => $manager->id,
            'approved_by' => $manager->id,
        ]);

        $assignmentId = Assignment::where('staff_id', $staffUserId)->value('id');

        $this->assertDatabaseHas('assignment_details', [
            'assignment_id' => $assignmentId,
            'asset_id' => $asset->id,
        ]);

        $this->assertDatabaseHas('asset_assignments', [
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'assigned_by' => $manager->id,
            'unassigned_at' => null,
        ]);

        $this->actingAs($manager)
            ->getJson("/api/assets/{$asset->id}")
            ->assertOk()
            ->assertJsonPath('asset.current_assignment.assignee.id', $employee->id)
            ->assertJsonPath('asset.responsible_employee.id', $employee->id)
            ->assertJsonPath('asset.assignment_history.0.employee.id', $employee->id);

        $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/unassign")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['return_condition']);

        $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/unassign", [
                'return_condition' => 'Thiết bị hoạt động bình thường khi thu hồi.',
            ])
            ->assertOk()
            ->assertJsonPath('previous_assignment.staff_id', $staffUserId)
            ->assertJsonPath('previous_assignment.employee_id', $employee->id);

        $this->assertDatabaseHas('returns', [
            'assignment_id' => $assignmentId,
            'staff_id' => $staffUserId,
            'admin_id' => $manager->id,
            'approved_by' => $manager->id,
            'return_condition' => 'Thiết bị hoạt động bình thường khi thu hồi.',
        ]);

        $this->assertDatabaseMissing('asset_assignments', [
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'unassigned_at' => null,
        ]);
    }

    public function test_assigning_already_assigned_asset_returns_validation_error(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();
        $otherEmployee = Employee::factory()->create();
        $asset = Asset::factory()->create(['status' => Asset::STATUS_ACTIVE]);

        AssetAssignment::factory()->create([
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'assigned_by' => $manager->id,
            'unassigned_at' => null,
        ]);

        $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/assign", [
                'employee_id' => $otherEmployee->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'ALREADY_ASSIGNED')
            ->assertJsonPath('current_assignment.employee_id', $employee->id);
    }

    public function test_locked_or_retired_assets_cannot_be_assigned(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();
        $maintenance = Asset::factory()->create(['status' => Asset::STATUS_MAINTENANCE]);
        $retired = Asset::factory()->create(['status' => Asset::STATUS_RETIRED]);

        $this->actingAs($manager)
            ->postJson("/api/assets/{$maintenance->id}/assign", [
                'employee_id' => $employee->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'ASSET_LOCKED');

        $this->actingAs($manager)
            ->postJson("/api/assets/{$retired->id}/assign", [
                'employee_id' => $employee->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'ASSET_NOT_ACTIVE');
    }

    public function test_employee_dropdown_returns_only_assets_the_employee_is_responsible_for(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create(['employee_code' => 'EMP-DROP-001']);
        $otherEmployee = Employee::factory()->create(['employee_code' => 'EMP-DROP-002']);
        $employeeUser = User::factory()->employee()->create([
            'employee_id' => $employee->id,
            'must_change_password' => false,
        ]);

        $ownAsset = Asset::factory()->create([
            'asset_code' => 'IT-LAP-1001',
            'name' => 'Employee Laptop',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $otherAsset = Asset::factory()->create([
            'asset_code' => 'IT-MON-1001',
            'name' => 'Other Monitor',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        AssetAssignment::factory()->create([
            'asset_id' => $ownAsset->id,
            'employee_id' => $employee->id,
            'department_name' => null,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
            'unassigned_at' => null,
        ]);
        AssetAssignment::factory()->create([
            'asset_id' => $otherAsset->id,
            'employee_id' => $otherEmployee->id,
            'department_name' => null,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
            'unassigned_at' => null,
        ]);

        $this->actingAs($employeeUser)
            ->getJson('/api/my-assigned-assets/dropdown')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.value', $ownAsset->id)
            ->assertJsonPath('data.0.responsible_employee.id', $employee->id);
    }
}
