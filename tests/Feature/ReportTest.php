<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\Feedback;
use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ShiftSeeder::class);
    }

    // =========================================================================
    // ACCESS CONTROL
    // =========================================================================

    public function test_admin_can_access_report_summary(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonStructure([
                'period' => ['from', 'to'],
                'assets',
                'maintenance',
                'requests',
                'feedback',
            ]);
    }

    public function test_hr_can_access_report_summary(): void
    {
        $hr = User::factory()->hr()->create();

        $response = $this->actingAs($hr)->getJson('/api/reports/summary');

        $response->assertOk();
    }

    public function test_technician_cannot_access_report_summary(): void
    {
        $technician = User::factory()->technician()->create();

        $response = $this->actingAs($technician)->getJson('/api/reports/summary');

        $response->assertForbidden();
    }

    public function test_doctor_cannot_access_report_summary(): void
    {
        $doctor = User::factory()->doctor()->create();

        $response = $this->actingAs($doctor)->getJson('/api/reports/summary');

        $response->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_report_summary(): void
    {
        $response = $this->getJson('/api/reports/summary');

        $response->assertUnauthorized();
    }

    // =========================================================================
    // ASSET STATS
    // =========================================================================

    public function test_report_includes_asset_stats(): void
    {
        $admin = User::factory()->admin()->create();

        Asset::factory()->count(5)->create(['status' => 'active']);
        Asset::factory()->count(2)->create(['status' => 'off_service']);
        Asset::factory()->count(1)->create(['status' => 'maintenance']);
        Asset::factory()->count(3)->create(['status' => 'retired']);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('assets.total', 11)
            ->assertJsonPath('assets.active', 5)
            ->assertJsonPath('assets.locked', 3) // off_service + maintenance
            ->assertJsonPath('assets.retired', 3);
    }

    // =========================================================================
    // MAINTENANCE STATS
    // =========================================================================

    public function test_report_includes_maintenance_stats(): void
    {
        $admin = User::factory()->admin()->create();
        $asset = Asset::factory()->create();

        // Create overdue
        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'status' => 'scheduled',
            'planned_at' => now()->subDays(5),
        ]);

        // Create in progress
        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'status' => 'in_progress',
            'planned_at' => now(),
        ]);

        // Create scheduled (future)
        MaintenanceEvent::factory()->create([
            'asset_id' => $asset->id,
            'status' => 'scheduled',
            'planned_at' => now()->addDays(5),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('maintenance.overdue', 1)
            ->assertJsonPath('maintenance.in_progress', 1)
            ->assertJsonPath('maintenance.scheduled', 1);
    }

    // =========================================================================
    // REQUEST STATS
    // =========================================================================

    public function test_report_includes_request_stats(): void
    {
        $admin = User::factory()->admin()->create();

        AssetRequest::factory()->count(3)->create(['status' => 'submitted']);
        AssetRequest::factory()->count(2)->create(['status' => 'approved']);
        AssetRequest::factory()->count(1)->create(['status' => 'rejected']);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('requests.pending', 3);
    }

    // =========================================================================
    // FEEDBACK STATS
    // =========================================================================

    public function test_report_includes_feedback_stats(): void
    {
        $admin = User::factory()->admin()->create();

        Feedback::factory()->count(4)->create(['status' => 'new']);
        Feedback::factory()->count(2)->create(['status' => 'in_progress']);
        Feedback::factory()->count(3)->create(['status' => 'resolved']);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('feedback.unresolved', 6)
            ->assertJsonPath('feedback.by_status.new', 4)
            ->assertJsonPath('feedback.by_status.in_progress', 2)
            ->assertJsonPath('feedback.by_status.resolved', 3);
    }

    // =========================================================================
    // DATE RANGE FILTER
    // =========================================================================

    public function test_report_respects_date_range(): void
    {
        $admin = User::factory()->admin()->create();

        // Created this month
        Feedback::factory()->count(3)->create([
            'created_at' => now(),
        ]);

        // Created last month
        Feedback::factory()->count(5)->create([
            'created_at' => now()->subMonth(),
        ]);

        $from = now()->startOfMonth()->toDateString();
        $to = now()->endOfMonth()->toDateString();

        $response = $this->actingAs($admin)->getJson("/api/reports/summary?from={$from}&to={$to}");

        $response->assertOk()
            ->assertJsonPath('feedback.created_in_period', 3);
    }
}
