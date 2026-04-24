<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Disposal;
use App\Models\InventoryCheck;
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
                'disposal',
                'inventory',
            ]);
    }

    public function test_legacy_hr_alias_cannot_access_report_summary(): void
    {
        $hr = User::factory()->hr()->create();

        $response = $this->actingAs($hr)->getJson('/api/reports/summary');

        $response->assertForbidden();
    }

    public function test_technician_cannot_access_report_summary(): void
    {
        $technician = User::factory()->technician()->create();

        $response = $this->actingAs($technician)->getJson('/api/reports/summary');

        $response->assertForbidden();
    }

    public function test_employee_cannot_access_report_summary(): void
    {
        $employee = User::factory()->employee()->create();

        $response = $this->actingAs($employee)->getJson('/api/reports/summary');

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
    // INVENTORY STATS
    // =========================================================================

    public function test_report_includes_inventory_stats(): void
    {
        $admin = User::factory()->admin()->create();

        InventoryCheck::create([
            'title' => 'Monthly inventory',
            'check_date' => now()->toDateString(),
            'status' => InventoryCheck::STATUS_IN_PROGRESS,
            'created_by_user_id' => $admin->id,
        ]);

        InventoryCheck::create([
            'title' => 'Completed inventory',
            'check_date' => now()->toDateString(),
            'status' => InventoryCheck::STATUS_COMPLETED,
            'created_by_user_id' => $admin->id,
            'completed_by_user_id' => $admin->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('inventory.total', 2)
            ->assertJsonPath('inventory.in_progress', 1)
            ->assertJsonPath('inventory.completed_in_period', 1);
    }

    // =========================================================================
    // DISPOSAL STATS
    // =========================================================================

    public function test_report_includes_disposal_stats(): void
    {
        $admin = User::factory()->admin()->create();

        $destroyedAsset = Asset::factory()->retired()->withValuation()->create();
        $liquidatedAsset = Asset::factory()->retired()->withValuation()->create();

        Disposal::create([
            'code' => 'DSP-202604-0001',
            'asset_id' => $destroyedAsset->id,
            'method' => 'destroy',
            'reason' => 'Broken beyond repair',
            'disposed_by_user_id' => $admin->id,
            'approved_by_user_id' => $admin->id,
            'disposed_at' => now(),
            'asset_book_value' => 1000,
            'proceeds_amount' => 0,
        ]);

        Disposal::create([
            'code' => 'DSP-202604-0002',
            'asset_id' => $liquidatedAsset->id,
            'method' => 'liquidation',
            'reason' => 'Replaced by new unit',
            'disposed_by_user_id' => $admin->id,
            'approved_by_user_id' => $admin->id,
            'disposed_at' => now(),
            'asset_book_value' => 2000,
            'proceeds_amount' => 750,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/reports/summary');

        $response->assertOk()
            ->assertJsonPath('disposal.retired_total', 2)
            ->assertJsonPath('disposal.retired_in_period', 2)
            ->assertJsonPath('disposal.by_method.destroy', 1)
            ->assertJsonPath('disposal.by_method.liquidation', 1)
            ->assertJsonPath('disposal.recovered_value', 750);
    }

    // =========================================================================
    // DATE RANGE FILTER
    // =========================================================================

    public function test_report_respects_date_range(): void
    {
        $admin = User::factory()->admin()->create();

        $assetThisMonth = Asset::factory()->retired()->withValuation()->create();
        $assetLastMonth = Asset::factory()->retired()->withValuation()->create();

        Disposal::create([
            'code' => 'DSP-202604-0010',
            'asset_id' => $assetThisMonth->id,
            'method' => 'destroy',
            'reason' => 'Monthly disposal',
            'disposed_by_user_id' => $admin->id,
            'approved_by_user_id' => $admin->id,
            'disposed_at' => now(),
            'asset_book_value' => 100,
        ]);

        Disposal::create([
            'code' => 'DSP-202603-0011',
            'asset_id' => $assetLastMonth->id,
            'method' => 'destroy',
            'reason' => 'Previous month disposal',
            'disposed_by_user_id' => $admin->id,
            'approved_by_user_id' => $admin->id,
            'disposed_at' => now()->subMonth(),
            'asset_book_value' => 120,
        ]);

        $from = now()->startOfMonth()->toDateString();
        $to = now()->endOfMonth()->toDateString();

        $response = $this->actingAs($admin)->getJson("/api/reports/summary?from={$from}&to={$to}");

        $response->assertOk()
            ->assertJsonPath('disposal.retired_in_period', 1);
    }
}
