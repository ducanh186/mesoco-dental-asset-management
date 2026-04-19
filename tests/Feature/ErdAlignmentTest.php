<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\InventoryCheck;
use App\Models\InventoryCheckItem;
use App\Models\MaintenanceDetail;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErdAlignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_role_is_normalized_and_linked_to_roles_table(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
            'must_change_password' => false,
        ]);

        $user->refresh()->load('roleDefinition');

        $this->assertSame('employee', $user->role);
        $this->assertNotNull($user->role_id);
        $this->assertSame('employee', $user->roleDefinition?->code);
    }

    public function test_doctor_role_is_now_collapsed_into_employee(): void
    {
        $user = User::factory()->create([
            'role' => 'doctor',
            'must_change_password' => false,
        ]);

        $user->refresh()->load('roleDefinition');

        $this->assertSame('employee', $user->role);
        $this->assertSame('employee', $user->roleDefinition?->code);
    }

    public function test_user_role_is_synced_to_account_role_pivot(): void
    {
        $manager = User::factory()->manager()->create([
            'must_change_password' => false,
        ]);

        $manager->refresh();

        $this->assertDatabaseHas('account_roles', [
            'user_id' => $manager->id,
            'role_id' => $manager->role_id,
            'status' => 'active',
        ]);
    }

    public function test_roles_have_permission_foreign_key_records(): void
    {
        $permission = Permission::query()->where('code', 'inventory.manage')->first();

        $this->assertNotNull($permission);
        $this->assertDatabaseHas('role_permissions', [
            'permission_id' => $permission->id,
        ]);
    }

    public function test_retiring_asset_creates_disposal_record(): void
    {
        $admin = User::factory()->admin()->create(['must_change_password' => false]);
        $asset = Asset::factory()->withValuation()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($admin)->postJson("/api/disposal/assets/{$asset->id}/retire", [
            'reason' => 'End of life',
            'method' => 'liquidation',
            'proceeds_amount' => 120000,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.disposal.method', 'liquidation');

        $this->assertDatabaseHas('disposals', [
            'asset_id' => $asset->id,
            'method' => 'liquidation',
            'reason' => 'End of life',
        ]);

        $this->assertDatabaseHas('disposal_details', [
            'asset_id' => $asset->id,
            'proceeds_amount' => 120000,
        ]);
    }

    public function test_creating_repair_maintenance_event_writes_detail_and_assignment_fk(): void
    {
        $technician = User::factory()->technician()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create();

        $response = $this->actingAs($technician)->postJson('/api/maintenance-events', [
            'asset_id' => $asset->id,
            'type' => 'repair',
            'planned_at' => now()->addDay()->toDateTimeString(),
            'assigned_to_user_id' => $technician->id,
            'note' => 'Replace motor assembly',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.assigned_to_user_id', $technician->id)
            ->assertJsonPath('data.assigned_to', $technician->name);

        $eventId = $response->json('data.id');

        $this->assertDatabaseHas('maintenance_details', [
            'maintenance_event_id' => $eventId,
            'asset_id' => $asset->id,
            'technician_user_id' => $technician->id,
            'status' => 'scheduled',
        ]);

        $this->assertTrue(MaintenanceDetail::query()->where('maintenance_event_id', $eventId)->exists());
    }

    public function test_inventory_check_has_detail_items(): void
    {
        $technician = User::factory()->technician()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
            'location' => 'Room 101',
        ]);

        $response = $this->actingAs($technician)->postJson('/api/inventory/checks', [
            'title' => 'Monthly inventory',
            'asset_ids' => [$asset->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.items_count', 1);

        $check = InventoryCheck::query()->first();
        $item = InventoryCheckItem::query()->first();

        $this->assertSame($check->id, $item->inventory_check_id);
        $this->assertSame($asset->id, $item->asset_id);
        $this->assertSame(InventoryCheckItem::RESULT_PENDING, $item->result);
    }
}
