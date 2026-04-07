<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\RequestItem;
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

    public function test_reviewing_request_creates_approval_record(): void
    {
        $admin = User::factory()->admin()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();
        $requester = User::factory()->create([
            'employee_id' => $employee->id,
            'role' => 'employee',
            'must_change_password' => false,
        ]);

        $request = AssetRequest::create([
            'code' => AssetRequest::generateCode(),
            'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
            'status' => AssetRequest::STATUS_SUBMITTED,
            'requested_by_employee_id' => $employee->id,
            'title' => 'Need gloves',
        ]);

        $request->items()->create([
            'item_kind' => RequestItem::KIND_CONSUMABLE,
            'name' => 'Gloves',
            'qty' => 10,
            'unit' => 'box',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/requests/{$request->id}/review", [
            'action' => 'APPROVE',
            'note' => 'Approved for stock replenishment',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('approvals', [
            'approvable_type' => AssetRequest::class,
            'approvable_id' => $request->id,
            'reviewer_user_id' => $admin->id,
            'status' => 'approved',
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
    }

    public function test_creating_repair_maintenance_event_writes_repair_log_and_assignment_fk(): void
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

        $this->assertDatabaseHas('repair_logs', [
            'maintenance_event_id' => $eventId,
            'asset_id' => $asset->id,
            'technician_user_id' => $technician->id,
            'status' => 'scheduled',
        ]);
    }
}
