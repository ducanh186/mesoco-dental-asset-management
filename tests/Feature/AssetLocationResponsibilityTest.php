<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLocationResponsibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_location_requires_unique_code_for_active_location_catalog(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);

        $this->actingAs($manager)
            ->postJson('/api/locations', [
                'name' => 'Kho IT',
                'description' => 'Kho thiết bị IT',
                'is_active' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['code']);

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
            ->assertJsonPath('asset.responsible_employee.position', 'IT Support');
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
