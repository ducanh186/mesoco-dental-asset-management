<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetQrIdentity;
use App\Models\Employee;
use App\Models\MaintenanceDetail;
use App\Models\MaintenanceEvent;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\RepairLog;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetQrPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_regenerate_qr_for_asset(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create([
            'name' => 'Portal Laptop',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($manager)
            ->postJson("/api/assets/{$asset->id}/regenerate-qr")
            ->assertOk()
            ->assertJsonPath('asset.id', $asset->id)
            ->assertJsonPath('asset.name', 'Portal Laptop');

        $payload = $response->json('asset.qr.payload');
        $portalUrl = $response->json('asset.qr.portal_url');

        $this->assertNotNull($payload);
        $this->assertStringStartsWith('MESOCO|ASSET|v1|', $payload);
        $this->assertStringContainsString('/asset-portal/', $portalUrl);

        $this->assertDatabaseHas('asset_qr_identities', [
            'asset_id' => $asset->id,
            'payload_version' => 'v1',
        ]);

        $asset->refresh();
        $this->assertSame($payload, $asset->qr_code);
        $this->assertSame($payload, $asset->qr_value);
    }

    public function test_internal_user_can_resolve_qr_payload_to_asset_data(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create([
            'name' => 'Resolve Workstation',
            'serial_number' => 'SN-QR-0001',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $qrIdentity = AssetQrIdentity::create([
            'qr_uid' => '11111111-1111-4111-8111-111111111111',
            'asset_id' => $asset->id,
            'payload_version' => 'v1',
            'printed_at' => now(),
        ]);

        $payload = 'MESOCO|ASSET|v1|' . $qrIdentity->qr_uid;

        $this->actingAs($employee)
            ->postJson('/api/qr/resolve', ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('asset.id', $asset->id)
            ->assertJsonPath('asset.name', 'Resolve Workstation')
            ->assertJsonPath('asset.serial_number', 'SN-QR-0001')
            ->assertJsonPath('asset.qr.uid', $qrIdentity->qr_uid)
            ->assertJsonPath('asset.qr.payload', $payload)
            ->assertJsonPath('portal_url', route('asset-portal.show', ['qrUid' => $qrIdentity->qr_uid]));
    }

    public function test_qr_resolve_filters_asset_portal_data_by_user_role(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);
        $technician = User::factory()->technician()->create(['must_change_password' => false]);
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        [$asset, $payload] = $this->seedRoleAwarePortalAsset();

        $employeeAsset = $this->actingAs($employee)
            ->postJson('/api/qr/resolve', ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('asset.visibility.role', 'employee')
            ->assertJsonPath('asset.name', 'Role Aware Laptop')
            ->assertJsonPath('asset.configuration', 'Core i7 / 32GB RAM / 1TB SSD')
            ->assertJsonPath('asset.warranty_status.status', 'active')
            ->json('asset');

        $this->assertSame('Nguyen Van Chu So Huu', $employeeAsset['responsible_employee']['full_name']);
        $this->assertArrayNotHasKey('technical', $employeeAsset);
        $this->assertArrayNotHasKey('supplier', $employeeAsset);
        $this->assertArrayNotHasKey('purchase_price', $employeeAsset);

        $technicianAsset = $this->actingAs($technician)
            ->postJson('/api/qr/resolve', ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('asset.visibility.role', 'technician')
            ->assertJsonPath('asset.technical.last_issue_note', 'SSD failure')
            ->json('asset');

        $this->assertEquals(25.0, $technicianAsset['technical']['current_depreciation_rate']);
        $this->assertEquals(9000000.0, $technicianAsset['technical']['remaining_value']);
        $this->assertArrayHasKey('repair_logs', $technicianAsset['technical']);
        $this->assertArrayNotHasKey('supplier', $technicianAsset);
        $this->assertArrayNotHasKey('purchase_price', $technicianAsset);

        $managerAsset = $this->actingAs($manager)
            ->postJson('/api/qr/resolve', ['payload' => $payload])
            ->assertOk()
            ->assertJsonPath('asset.visibility.role', 'manager')
            ->assertJsonPath('asset.technical.last_issue_note', 'SSD failure')
            ->assertJsonPath('asset.supplier.name', 'Mesoco Supplier')
            ->assertJsonPath('asset.purchase_date', '2026-05-01')
            ->json('asset');

        $this->assertSame($asset->id, $managerAsset['id']);
        $this->assertEquals(12000000.0, $managerAsset['purchase_price']);
    }

    public function test_asset_portal_view_renders_resolved_asset_details(): void
    {
        $asset = Asset::factory()->create([
            'name' => 'Portal Monitor',
            'serial_number' => 'SN-PORTAL-001',
            'model' => 'Dell U2724D',
            'configuration' => '27 inch QHD monitor',
            'status' => Asset::STATUS_ACTIVE,
        ]);
        $qrIdentity = AssetQrIdentity::create([
            'qr_uid' => '22222222-2222-4222-8222-222222222222',
            'asset_id' => $asset->id,
            'payload_version' => 'v1',
            'printed_at' => now(),
        ]);

        $this->get("/asset-portal/{$qrIdentity->qr_uid}")
            ->assertOk()
            ->assertSee('Portal Monitor')
            ->assertSee('SN-PORTAL-001')
            ->assertSee('Dell U2724D')
            ->assertSee('27 inch QHD monitor')
            ->assertSee('MESOCO|ASSET|v1|' . $qrIdentity->qr_uid);
    }

    private function seedRoleAwarePortalAsset(): array
    {
        $ownerEmployee = Employee::factory()->create([
            'employee_code' => 'EMP-OWNER-001',
            'full_name' => 'Nguyen Van Chu So Huu',
            'status' => 'active',
        ]);
        User::factory()->employee()->create([
            'employee_id' => $ownerEmployee->id,
            'employee_code' => $ownerEmployee->employee_code,
            'username' => 'asset.owner',
            'name' => $ownerEmployee->full_name,
            'full_name' => $ownerEmployee->full_name,
            'must_change_password' => false,
        ]);

        $supplier = Supplier::factory()->create([
            'name' => 'Mesoco Supplier',
            'contact_person' => 'NCC Contact',
            'phone' => '0909000000',
        ]);
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create([
            'name' => 'Role Aware Laptop',
            'asset_code' => 'IT-LAP-ROLE-001',
            'serial_number' => 'SN-ROLE-001',
            'model' => 'ThinkPad X1',
            'configuration' => 'Core i7 / 32GB RAM / 1TB SSD',
            'status' => Asset::STATUS_ACTIVE,
            'purchase_price' => 12000000,
            'purchase_cost' => 12000000,
            'current_depreciation_rate' => 25,
            'depreciation_rate' => 25,
            'warranty_expiry' => now()->addYear()->toDateString(),
            'supplier_id' => $supplier->id,
        ]);

        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $ownerEmployee->id,
            'assigned_by' => $manager->id,
            'assigned_at' => now()->subMonths(2),
        ]);

        $purchaseOrder = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'approved_by_user_id' => $manager->id,
            'order_date' => '2026-05-01',
            'total_amount' => 12000000,
        ]);
        PurchaseOrderItem::factory()->create([
            'purchase_order_id' => $purchaseOrder->id,
            'asset_id' => $asset->id,
            'item_name' => $asset->name,
            'qty' => 1,
            'unit_price' => 12000000,
            'line_total' => 12000000,
        ]);

        $maintenanceEvent = MaintenanceEvent::factory()->completed()->create([
            'asset_id' => $asset->id,
            'completed_at' => '2026-05-07 10:00:00',
            'cost' => 500000,
        ]);
        MaintenanceDetail::create([
            'maintenance_event_id' => $maintenanceEvent->id,
            'asset_id' => $asset->id,
            'technician_user_id' => User::factory()->technician()->create(['must_change_password' => false])->id,
            'status' => 'completed',
            'issue_description' => 'SSD failure',
            'action_taken' => 'Replaced SSD',
            'cost' => 500000,
            'started_at' => '2026-05-07 09:00:00',
            'completed_at' => '2026-05-07 10:00:00',
            'logged_at' => '2026-05-07 10:05:00',
        ]);
        RepairLog::create([
            'asset_id' => $asset->id,
            'maintenance_event_id' => $maintenanceEvent->id,
            'technician_user_id' => $maintenanceEvent->assigned_to_user_id,
            'status' => 'completed',
            'issue_description' => 'SSD failure',
            'action_taken' => 'Replaced SSD',
            'cost' => 500000,
            'started_at' => '2026-05-07 09:00:00',
            'completed_at' => '2026-05-07 10:00:00',
            'logged_at' => '2026-05-07 10:05:00',
        ]);

        $qrIdentity = AssetQrIdentity::create([
            'qr_uid' => '33333333-3333-4333-8333-333333333333',
            'asset_id' => $asset->id,
            'payload_version' => 'v1',
            'printed_at' => now(),
        ]);

        return [$asset, 'MESOCO|ASSET|v1|' . $qrIdentity->qr_uid];
    }
}
