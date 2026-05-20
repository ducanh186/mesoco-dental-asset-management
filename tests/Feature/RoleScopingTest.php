<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\MaintenanceEvent;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Cover role-based scoping rules that were tightened in the 16/5 refinement:
 *  - Technician and employee see only their own request forms by default.
 *  - Technician sees only maintenance events assigned to them.
 *  - Technician and employee cannot mutate purchase orders.
 *  - /api/my-devices returns only assets assigned to the current employee.
 *  - Employees can read the asset catalog.
 */
class RoleScopingTest extends TestCase
{
    use RefreshDatabase;

    private function makeUserWithEmployee(string $role): array
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create([
            'role' => $role,
            'employee_id' => $employee->id,
            'must_change_password' => false,
        ]);

        return [$user, $employee];
    }

    public function test_technician_request_list_is_scoped_to_own_requests(): void
    {
        [$technician, $techEmployee] = $this->makeUserWithEmployee(User::ROLE_TECHNICIAN);
        [$_, $otherEmployee] = $this->makeUserWithEmployee(User::ROLE_EMPLOYEE);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
            'status' => AssetRequest::STATUS_SUBMITTED,
            'requested_by_employee_id' => $techEmployee->id,
            'title' => 'Phiếu của technician',
        ]);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
            'status' => AssetRequest::STATUS_SUBMITTED,
            'requested_by_employee_id' => $otherEmployee->id,
            'title' => 'Phiếu của người khác',
        ]);

        $response = $this->actingAs($technician)->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.title', 'Phiếu của technician');
    }

    public function test_manager_request_list_includes_all_requests(): void
    {
        [$manager] = $this->makeUserWithEmployee(User::ROLE_MANAGER);
        [$_, $otherEmployee] = $this->makeUserWithEmployee(User::ROLE_EMPLOYEE);

        AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
            'status' => AssetRequest::STATUS_SUBMITTED,
            'requested_by_employee_id' => $otherEmployee->id,
            'title' => 'Phiếu của nhân viên',
        ]);

        $response = $this->actingAs($manager)->getJson('/api/requests');

        $response->assertOk()
            ->assertJsonCount(1, 'requests')
            ->assertJsonPath('requests.0.title', 'Phiếu của nhân viên');
    }

    public function test_technician_maintenance_index_is_scoped_to_assigned_events(): void
    {
        [$technician] = $this->makeUserWithEmployee(User::ROLE_TECHNICIAN);
        [$otherTechnician] = $this->makeUserWithEmployee(User::ROLE_TECHNICIAN);
        $asset = Asset::factory()->create();

        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'assigned_to_user_id' => $technician->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'assigned_to_user_id' => $otherTechnician->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'assigned_to_user_id' => null,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        $response = $this->actingAs($technician)->getJson('/api/maintenance-events');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_manager_maintenance_index_is_not_scoped_by_default(): void
    {
        [$manager] = $this->makeUserWithEmployee(User::ROLE_MANAGER);
        [$technician] = $this->makeUserWithEmployee(User::ROLE_TECHNICIAN);
        $asset = Asset::factory()->create();

        MaintenanceEvent::factory()->count(2)->create([
            'asset_id' => $asset->id,
            'assigned_to_user_id' => $technician->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'assigned_to_user_id' => null,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        $response = $this->actingAs($manager)->getJson('/api/maintenance-events');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_technician_cannot_create_purchase_order(): void
    {
        [$technician] = $this->makeUserWithEmployee(User::ROLE_TECHNICIAN);
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($technician)->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => '2026-05-20',
            'status' => 'preparing',
            'items' => [
                ['item_name' => 'Pin', 'qty' => 1, 'unit' => 'cái'],
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_employee_cannot_list_purchase_orders(): void
    {
        [$employee] = $this->makeUserWithEmployee(User::ROLE_EMPLOYEE);

        $response = $this->actingAs($employee)->getJson('/api/purchase-orders');

        $response->assertStatus(403);
    }

    public function test_my_devices_returns_only_assigned_assets(): void
    {
        [$employee, $employeeRecord] = $this->makeUserWithEmployee(User::ROLE_EMPLOYEE);
        [$manager] = $this->makeUserWithEmployee(User::ROLE_MANAGER);
        $otherEmployee = Employee::factory()->create();

        $mine = Asset::factory()->create([
            'asset_code' => 'IT-LAP-9001',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $someoneElses = Asset::factory()->create([
            'asset_code' => 'IT-LAP-9002',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        AssetAssignment::create([
            'asset_id' => $mine->id,
            'employee_id' => $employeeRecord->id,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
        ]);

        AssetAssignment::create([
            'asset_id' => $someoneElses->id,
            'employee_id' => $otherEmployee->id,
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($employee)->getJson('/api/my-devices');

        $response->assertOk()
            ->assertJsonCount(1, 'assets')
            ->assertJsonPath('assets.0.asset_code', 'IT-LAP-9001')
            ->assertJsonPath('summary.total', 1);
    }

    public function test_employee_can_read_asset_catalog(): void
    {
        [$employee] = $this->makeUserWithEmployee(User::ROLE_EMPLOYEE);
        Asset::factory()->count(2)->create();

        $response = $this->actingAs($employee)->getJson('/api/assets');

        $response->assertOk()
            ->assertJsonStructure(['assets', 'pagination', 'summary']);
    }
}
