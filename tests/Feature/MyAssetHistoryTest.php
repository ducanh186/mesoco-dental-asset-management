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
 * Phase 6: My Asset History API Tests
 * Tests ownership enforcement - users can only see their own history
 */
class MyAssetHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $doctor;
    protected User $otherDoctor;
    protected Employee $doctorEmployee;
    protected Employee $otherDoctorEmployee;
    protected Shift $shift;

    protected function setUp(): void
    {
        parent::setUp();

        // Create employees first
        $this->doctorEmployee = Employee::factory()->create();
        $this->otherDoctorEmployee = Employee::factory()->create();

        // Create users linked to employees
        $this->admin = User::factory()->create(['role' => 'admin', 'must_change_password' => false]);
        $this->doctor = User::factory()->create([
            'role' => 'doctor', 
            'must_change_password' => false,
            'employee_id' => $this->doctorEmployee->id
        ]);
        $this->otherDoctor = User::factory()->create([
            'role' => 'doctor', 
            'must_change_password' => false,
            'employee_id' => $this->otherDoctorEmployee->id
        ]);

        // Create shift for check-ins
        $this->shift = Shift::factory()->create();
    }

    // =========================================================================
    // GET /api/my-asset-history - All roles, ownership enforced
    // =========================================================================

    public function test_authenticated_user_can_access_their_history(): void
    {
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'events',
                'pagination' => ['current_page', 'last_page', 'per_page', 'total'],
                'filters' => ['event_types'],
            ]);
    }

    public function test_admin_can_access_their_own_history(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/my-asset-history');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_cannot_access_history(): void
    {
        $response = $this->getJson('/api/my-asset-history');

        $response->assertStatus(401);
    }

    public function test_user_only_sees_their_own_assignment_history(): void
    {
        // Create assignments for doctor
        $doctorAsset = Asset::factory()->create();
        AssetAssignment::create([
            'asset_id' => $doctorAsset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(5),
        ]);

        // Create assignments for other doctor
        $otherAsset = Asset::factory()->create();
        AssetAssignment::create([
            'asset_id' => $otherAsset->id,
            'employee_id' => $this->otherDoctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(3),
        ]);

        // Doctor should only see their own assignment
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history');

        $response->assertStatus(200);
        
        $events = $response->json('events');
        foreach ($events as $event) {
            // Should only see events for assets assigned to them
            if ($event['event_type'] === 'assigned') {
                $this->assertEquals($doctorAsset->id, $event['asset']['id']);
            }
        }
    }

    public function test_user_only_sees_their_own_checkin_history(): void
    {
        // Create check-in for doctor
        $asset = Asset::factory()->create();
        AssetCheckin::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctor->id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
        ]);

        // Create check-in for other doctor
        $otherAsset = Asset::factory()->create();
        AssetCheckin::create([
            'asset_id' => $otherAsset->id,
            'employee_id' => $this->otherDoctor->id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
        ]);

        // Doctor should only see their own check-ins
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history?event_type=checkin');

        $response->assertStatus(200);
        
        $events = $response->json('events');
        $this->assertCount(1, $events);
        $this->assertEquals($asset->id, $events[0]['asset']['id']);
    }

    public function test_user_cannot_see_other_users_history_via_any_parameter(): void
    {
        // Create assignment for other doctor
        $asset = Asset::factory()->create();
        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->otherDoctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(3),
        ]);

        // Try to access with asset_id filter (should still only show own history)
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history?asset_id=' . $asset->id);

        $response->assertStatus(200);
        
        // Should return empty because doctor has no history with this asset
        $events = $response->json('events');
        $this->assertEmpty($events);
    }

    // =========================================================================
    // GET /api/my-asset-history/summary - All roles
    // =========================================================================

    public function test_user_can_access_their_history_summary(): void
    {
        // Create some history data
        $asset = Asset::factory()->create();
        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(5),
        ]);

        AssetCheckin::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctor->id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
        ]);

        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary' => [
                    'total_assignments',
                    'current_assignments',
                    'total_checkins',
                    'checkins_this_month',
                ],
            ]);

        $summary = $response->json('summary');
        $this->assertEquals(1, $summary['total_assignments']);
        $this->assertEquals(1, $summary['current_assignments']);
        $this->assertEquals(1, $summary['total_checkins']);
    }

    public function test_summary_counts_are_user_specific(): void
    {
        // Create assignments for both doctors
        $asset1 = Asset::factory()->create();
        $asset2 = Asset::factory()->create();
        
        AssetAssignment::create([
            'asset_id' => $asset1->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(5),
        ]);

        AssetAssignment::create([
            'asset_id' => $asset2->id,
            'employee_id' => $this->otherDoctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(3),
        ]);

        // Doctor's summary should only count their own
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history/summary');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('summary.total_assignments'));
    }

    // =========================================================================
    // Filter tests
    // =========================================================================

    public function test_history_filters_by_event_type(): void
    {
        $asset = Asset::factory()->create();
        
        // Create assignment
        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(5),
        ]);

        // Create check-in
        AssetCheckin::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctor->id,
            'shift_id' => $this->shift->id,
            'shift_date' => now()->toDateString(),
            'checked_in_at' => now(),
        ]);

        // Filter by assigned only
        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history?event_type=assigned');

        $response->assertStatus(200);
        
        $events = $response->json('events');
        foreach ($events as $event) {
            $this->assertEquals('assigned', $event['event_type']);
        }
    }

    public function test_history_filters_by_date_range(): void
    {
        $asset = Asset::factory()->create();
        
        // Create old assignment
        AssetAssignment::create([
            'asset_id' => $asset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(30),
            'unassigned_at' => now()->subDays(25),
        ]);

        // Create recent assignment
        $asset2 = Asset::factory()->create();
        AssetAssignment::create([
            'asset_id' => $asset2->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now()->subDays(3),
        ]);

        // Filter for last 7 days
        $dateFrom = now()->subDays(7)->toDateString();
        $dateTo = now()->toDateString();
        
        $response = $this->actingAs($this->doctor)->getJson("/api/my-asset-history?date_from={$dateFrom}&date_to={$dateTo}");

        $response->assertStatus(200);
        
        // Should only include recent assignment
        $events = $response->json('events');
        $this->assertNotEmpty($events);
        
        foreach ($events as $event) {
            $eventDate = substr($event['event_at'], 0, 10);
            $this->assertGreaterThanOrEqual($dateFrom, $eventDate);
            $this->assertLessThanOrEqual($dateTo, $eventDate);
        }
    }

    public function test_history_pagination_works(): void
    {
        // Create many assignments
        for ($i = 0; $i < 25; $i++) {
            $asset = Asset::factory()->create();
            AssetAssignment::create([
                'asset_id' => $asset->id,
                'employee_id' => $this->doctorEmployee->id,
                'assigned_by' => $this->admin->id,
                'assigned_at' => now()->subDays($i),
            ]);
        }

        $response = $this->actingAs($this->doctor)->getJson('/api/my-asset-history?per_page=10');

        $response->assertStatus(200);
        
        $pagination = $response->json('pagination');
        $this->assertEquals(10, $pagination['per_page']);
        $this->assertEquals(25, $pagination['total']);
        $this->assertGreaterThan(1, $pagination['last_page']);
    }

    public function test_user_without_employee_profile_gets_empty_history(): void
    {
        // Create user without employee profile
        $userWithoutEmployee = User::factory()->create([
            'role' => 'staff',
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($userWithoutEmployee)->getJson('/api/my-asset-history');

        $response->assertStatus(200);
        $this->assertEmpty($response->json('events'));
        $this->assertStringContainsString('No employee profile', $response->json('message'));
    }
}
