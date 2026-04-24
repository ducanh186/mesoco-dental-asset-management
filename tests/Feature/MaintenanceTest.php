<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Maintenance Events and Off-Service Lock functionality.
 * 
 * Phase 7: Maintenance scheduling, state transitions, and asset locking.
 */
class MaintenanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $technician;
    protected User $employee;
    protected Asset $asset;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->technician = User::factory()->technician()->create();
        $this->employee = User::factory()->employee()->create();
        $this->asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CRUD Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_create_maintenance_event(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/maintenance-events', [
                'asset_id' => $this->asset->id,
                'type' => 'inspection',
                'planned_at' => now()->addDays(7)->toDateTimeString(),
                'priority' => 'normal',
                'note' => 'Annual inspection',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', MaintenanceEvent::STATUS_SCHEDULED)
            ->assertJsonPath('data.type', 'inspection');

        $this->assertDatabaseHas('maintenance_events', [
            'asset_id' => $this->asset->id,
            'type' => 'inspection',
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);
    }

    public function test_technician_can_create_maintenance_event(): void
    {
        $response = $this->actingAs($this->technician)
            ->postJson('/api/maintenance-events', [
                'asset_id' => $this->asset->id,
                'type' => 'calibration',
                'planned_at' => now()->addDays(3)->toDateTimeString(),
            ]);

        $response->assertStatus(201);
    }

    public function test_employee_cannot_create_maintenance_event(): void
    {
        $response = $this->actingAs($this->employee)
            ->postJson('/api/maintenance-events', [
                'asset_id' => $this->asset->id,
                'type' => 'inspection',
                'planned_at' => now()->addDays(7)->toDateTimeString(),
            ]);

        $response->assertStatus(403);
    }

    public function test_can_list_maintenance_events_with_filters(): void
    {
        MaintenanceEvent::factory()->count(3)->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'type' => 'inspection',
        ]);

        MaintenanceEvent::factory()->count(2)->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_COMPLETED,
            'type' => 'repair',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/maintenance-events?status=scheduled');

        $response->assertOk()
            ->assertJsonCount(3, 'data');

        $response = $this->actingAs($this->admin)
            ->getJson('/api/maintenance-events?type=repair');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_can_update_scheduled_maintenance_event(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/maintenance-events/{$event->id}", [
                'priority' => 'urgent',
                'note' => 'Updated note',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.priority', 'urgent');
    }

    public function test_cannot_update_completed_maintenance_event(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_COMPLETED,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/maintenance-events/{$event->id}", [
                'priority' => 'urgent',
            ]);

        $response->assertStatus(403);
    }

    public function test_can_delete_scheduled_maintenance_event(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/maintenance-events/{$event->id}");

        $response->assertOk();
        $this->assertSoftDeleted('maintenance_events', ['id' => $event->id]);
    }

    /*
    |--------------------------------------------------------------------------
    | State Transition Tests
    |--------------------------------------------------------------------------
    */

    public function test_can_start_scheduled_maintenance(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        $response = $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$event->id}/start");

        $response->assertOk()
            ->assertJsonPath('data.status', MaintenanceEvent::STATUS_IN_PROGRESS);

        // Asset should now be locked
        $this->asset->refresh();
        $this->assertEquals(Asset::STATUS_MAINTENANCE, $this->asset->status);
        $this->assertTrue($this->asset->isLocked());
    }

    public function test_cannot_start_completed_maintenance(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_COMPLETED,
        ]);

        $response = $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$event->id}/start");

        $response->assertStatus(403);
    }

    public function test_can_complete_in_progress_maintenance(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        // Set asset to maintenance status
        $this->asset->update(['status' => Asset::STATUS_MAINTENANCE]);

        $response = $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$event->id}/complete", [
                'result_note' => 'Completed successfully',
                'cost' => 150.00,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', MaintenanceEvent::STATUS_COMPLETED);

        // Asset should be unlocked
        $this->asset->refresh();
        $this->assertEquals(Asset::STATUS_ACTIVE, $this->asset->status);
        $this->assertFalse($this->asset->isLocked());
    }

    public function test_multi_asset_maintenance_locks_and_unlocks_every_asset_in_the_ticket(): void
    {
        $secondAsset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $createResponse = $this->actingAs($this->technician)
            ->postJson('/api/maintenance-events', [
                'type' => 'inspection',
                'planned_at' => now()->addDay()->toDateTimeString(),
                'details' => [
                    ['asset_id' => $this->asset->id, 'qty' => 1],
                    ['asset_id' => $secondAsset->id, 'qty' => 2],
                ],
                'note' => 'Department batch maintenance',
            ]);

        $createResponse->assertCreated();

        $eventId = $createResponse->json('data.id');

        $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$eventId}/start")
            ->assertOk();

        $this->asset->refresh();
        $secondAsset->refresh();

        $this->assertSame(Asset::STATUS_MAINTENANCE, $this->asset->status);
        $this->assertSame(Asset::STATUS_MAINTENANCE, $secondAsset->status);

        $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$eventId}/complete", [
                'result_note' => 'Completed batch maintenance',
            ])
            ->assertOk();

        $this->asset->refresh();
        $secondAsset->refresh();

        $this->assertSame(Asset::STATUS_ACTIVE, $this->asset->status);
        $this->assertSame(Asset::STATUS_ACTIVE, $secondAsset->status);
    }

    public function test_complete_maintenance_keeps_lock_if_other_active(): void
    {
        // Create two in_progress events for same asset
        $event1 = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $event2 = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now()->subHour(),
        ]);

        $this->asset->update(['status' => Asset::STATUS_MAINTENANCE]);

        // Complete first event
        $response = $this->actingAs($this->technician)
            ->postJson("/api/maintenance-events/{$event1->id}/complete");

        $response->assertOk();

        // Asset should still be locked (event2 is still in_progress)
        $this->asset->refresh();
        $this->assertEquals(Asset::STATUS_MAINTENANCE, $this->asset->status);
        $this->assertTrue($this->asset->isLocked());
    }

    public function test_can_cancel_scheduled_maintenance(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/maintenance-events/{$event->id}/cancel", [
                'reason' => 'Equipment not available',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', MaintenanceEvent::STATUS_CANCELED);
    }

    public function test_can_cancel_in_progress_maintenance(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $this->asset->update(['status' => Asset::STATUS_MAINTENANCE]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/maintenance-events/{$event->id}/cancel");

        $response->assertOk();

        // Asset should be unlocked
        $this->asset->refresh();
        $this->assertEquals(Asset::STATUS_ACTIVE, $this->asset->status);
    }

    /*
    |--------------------------------------------------------------------------
    | Lock/Unlock Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_manually_lock_asset(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/assets/{$this->asset->id}/lock", [
                'reason' => 'Broken handle - awaiting parts',
                'until' => now()->addDays(14)->toDateTimeString(),
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', Asset::STATUS_OFF_SERVICE);

        $this->asset->refresh();
        $this->assertTrue($this->asset->isLocked());
        $this->assertEquals('Broken handle - awaiting parts', $this->asset->off_service_reason);
    }

    public function test_technician_can_manually_lock_asset(): void
    {
        $response = $this->actingAs($this->technician)
            ->postJson("/api/assets/{$this->asset->id}/lock", [
                'reason' => 'Safety issue reported',
            ]);

        $response->assertOk();
    }

    public function test_employee_cannot_lock_asset(): void
    {
        $response = $this->actingAs($this->employee)
            ->postJson("/api/assets/{$this->asset->id}/lock", [
                'reason' => 'Test lock',
            ]);

        $response->assertStatus(403);
    }

    public function test_cannot_lock_already_locked_asset(): void
    {
        $this->asset->update([
            'status' => Asset::STATUS_OFF_SERVICE,
            'off_service_reason' => 'Already locked',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/assets/{$this->asset->id}/lock", [
                'reason' => 'Try again',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'ASSET_ALREADY_LOCKED');
    }

    public function test_admin_can_unlock_off_service_asset(): void
    {
        $this->asset->update([
            'status' => Asset::STATUS_OFF_SERVICE,
            'off_service_reason' => 'Test reason',
            'off_service_from' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/assets/{$this->asset->id}/unlock");

        $response->assertOk()
            ->assertJsonPath('data.status', Asset::STATUS_ACTIVE);

        $this->asset->refresh();
        $this->assertFalse($this->asset->isLocked());
    }

    public function test_cannot_unlock_asset_with_active_maintenance(): void
    {
        MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $this->asset->update(['status' => Asset::STATUS_MAINTENANCE]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/assets/{$this->asset->id}/unlock");

        $response->assertStatus(422)
            ->assertJsonPath('error', 'HAS_ACTIVE_MAINTENANCE');
    }

    public function test_can_view_lock_status(): void
    {
        $this->asset->update([
            'status' => Asset::STATUS_OFF_SERVICE,
            'off_service_reason' => 'Under investigation',
            'off_service_from' => now(),
            'off_service_until' => now()->addDays(7),
        ]);

        $response = $this->actingAs($this->employee)
            ->getJson("/api/assets/{$this->asset->id}/lock-status");

        $response->assertOk()
            ->assertJsonPath('is_locked', true)
            ->assertJsonPath('status', Asset::STATUS_OFF_SERVICE)
            ->assertJsonPath('lock_reason', 'Under investigation');
    }

    /*
    |--------------------------------------------------------------------------
    | Lock Effect Tests (Block operations on locked assets)
    |--------------------------------------------------------------------------
    */

    public function test_cannot_assign_locked_asset(): void
    {
        $this->asset->update(['status' => Asset::STATUS_MAINTENANCE]);

        $employee = \App\Models\Employee::factory()->create();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/assets/{$this->asset->id}/assign", [
                'employee_id' => $employee->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'ASSET_LOCKED');
    }

    public function test_cannot_checkin_locked_asset(): void
    {
        // First assign asset to an employee
        $employee = \App\Models\Employee::factory()->create();
        $assignment = \App\Models\AssetAssignment::factory()->create([
            'asset_id' => $this->asset->id,
            'employee_id' => $employee->id,
            'assigned_at' => now(),
        ]);
        $this->asset->update(['current_assignment_id' => $assignment->id]);

        // Create user linked to employee
        $user = User::factory()->create(['employee_id' => $employee->id]);

        // Lock the asset
        $this->asset->update(['status' => Asset::STATUS_OFF_SERVICE]);

        $shift = \App\Models\Shift::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/checkins', [
                'asset_id' => $this->asset->id,
                'shift_id' => $shift->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'ASSET_LOCKED');
    }

    /*
    |--------------------------------------------------------------------------
    | IDOR Protection Tests
    |--------------------------------------------------------------------------
    */

    public function test_technician_can_update_own_maintenance_event(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'created_by' => $this->technician->id,
        ]);

        $response = $this->actingAs($this->technician)
            ->putJson("/api/maintenance-events/{$event->id}", [
                'note' => 'Updated by owner',
            ]);

        $response->assertOk();
    }

    public function test_technician_cannot_update_others_maintenance_event(): void
    {
        $otherTechnician = User::factory()->technician()->create();

        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'created_by' => $otherTechnician->id,
        ]);

        $response = $this->actingAs($this->technician)
            ->putJson("/api/maintenance-events/{$event->id}", [
                'note' => 'Try to update others event',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_maintenance_event(): void
    {
        $event = MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'created_by' => $this->technician->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/maintenance-events/{$event->id}", [
                'note' => 'Admin override',
            ]);

        $response->assertOk();
    }

    /*
    |--------------------------------------------------------------------------
    | Summary/Statistics Tests
    |--------------------------------------------------------------------------
    */

    public function test_can_get_maintenance_summary(): void
    {
        MaintenanceEvent::factory()->count(3)->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'planned_at' => now()->addDays(3),
        ]);

        MaintenanceEvent::factory()->count(2)->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
        ]);

        // Overdue = planned_at < now - 24h, so use subDays(2) to be safely overdue
        MaintenanceEvent::factory()->create([
            'asset_id' => $this->asset->id,
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'planned_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/maintenance-events/summary');

        $response->assertOk()
            ->assertJsonPath('stats.scheduled', 4)
            ->assertJsonPath('stats.in_progress', 2)
            ->assertJsonPath('stats.overdue', 1);
    }
}
