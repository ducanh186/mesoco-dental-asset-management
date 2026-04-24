<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetDropdownTest extends TestCase
{
    use RefreshDatabase;

    private User $employeeUser;
    private Employee $employee;
    private User $manager;
    private Asset $employeeAssignedAsset;
    private Asset $departmentAssignedAsset;
    private Asset $inactiveAsset;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create([
            'role' => 'manager',
            'must_change_password' => false,
        ]);

        $this->employee = Employee::factory()->create([
            'employee_code' => 'EMP001',
            'full_name' => 'IT Support Staff',
            'department' => 'IT Support',
        ]);
        $this->employeeUser = User::factory()->create([
            'employee_id' => $this->employee->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        $this->employeeAssignedAsset = Asset::factory()->create([
            'asset_code' => 'IT-LAP-1001',
            'name' => 'Employee Laptop',
            'status' => Asset::STATUS_ACTIVE,
            'category' => 'Laptop',
        ]);

        $this->departmentAssignedAsset = Asset::factory()->create([
            'asset_code' => 'IT-MON-1001',
            'name' => 'Shared Monitor',
            'status' => Asset::STATUS_ACTIVE,
            'category' => 'Monitor',
        ]);

        $this->inactiveAsset = Asset::factory()->create([
            'asset_code' => 'IT-DES-1001',
            'name' => 'Inactive Desktop',
            'status' => Asset::STATUS_MAINTENANCE,
            'category' => 'Desktop',
        ]);

        AssetAssignment::create([
            'asset_id' => $this->employeeAssignedAsset->id,
            'employee_id' => $this->employee->id,
            'department_name' => 'IT Support',
            'assigned_by' => $this->manager->id,
            'assigned_at' => now(),
        ]);

        AssetAssignment::create([
            'asset_id' => $this->departmentAssignedAsset->id,
            'employee_id' => null,
            'department_name' => 'IT Support',
            'assigned_by' => $this->manager->id,
            'assigned_at' => now(),
        ]);

        AssetAssignment::create([
            'asset_id' => $this->inactiveAsset->id,
            'employee_id' => $this->employee->id,
            'department_name' => 'IT Support',
            'assigned_by' => $this->manager->id,
            'assigned_at' => now(),
        ]);
    }

    public function test_employee_can_see_employee_and_department_assets_in_dropdown(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/department-assets/dropdown');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'value' => $this->employeeAssignedAsset->id,
                'label' => 'IT-LAP-1001 - Employee Laptop',
                'asset_code' => 'IT-LAP-1001',
                'name' => 'Employee Laptop',
                'department_name' => 'IT Support',
            ])
            ->assertJsonFragment([
                'value' => $this->departmentAssignedAsset->id,
                'label' => 'IT-MON-1001 - Shared Monitor',
                'asset_code' => 'IT-MON-1001',
                'name' => 'Shared Monitor',
                'department_name' => 'IT Support',
            ]);

        $response->assertJsonMissing([
            'value' => $this->inactiveAsset->id,
        ]);
    }

    public function test_department_dropdown_excludes_users_without_employee_profile(): void
    {
        $userWithoutEmployee = User::factory()->create([
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($userWithoutEmployee)
            ->getJson('/api/department-assets/dropdown');

        $response->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_removed_loan_route_returns_gone(): void
    {
        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/assets/available-for-loan');

        $response->assertStatus(410);
    }

    public function test_dropdown_label_handles_null_asset_code(): void
    {
        $assetWithoutCode = Asset::factory()->create([
            'asset_code' => null,
            'name' => 'No Code Asset',
            'status' => Asset::STATUS_ACTIVE,
            'category' => 'Peripheral',
        ]);

        AssetAssignment::create([
            'asset_id' => $assetWithoutCode->id,
            'employee_id' => $this->employee->id,
            'department_name' => 'IT Support',
            'assigned_by' => $this->manager->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->getJson('/api/department-assets/dropdown');

        $response->assertOk();

        $noCodeAsset = collect($response->json('data'))->firstWhere('value', $assetWithoutCode->id);

        $this->assertNotNull($noCodeAsset);
        $this->assertEquals("No Code Asset (ID: {$assetWithoutCode->id})", $noCodeAsset['label']);
    }
}
