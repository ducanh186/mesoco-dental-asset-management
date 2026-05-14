<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetCatalogSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_asset_catalog_summary_counts_all_database_rows_not_current_page(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();

        Asset::factory()->count(3)->create(['status' => Asset::STATUS_ACTIVE]);
        $assignedAssets = Asset::factory()->count(2)->create(['status' => Asset::STATUS_ACTIVE]);
        Asset::factory()->create(['status' => Asset::STATUS_MAINTENANCE]);
        Asset::factory()->create(['status' => Asset::STATUS_INVENTORYING]);

        foreach ($assignedAssets as $asset) {
            AssetAssignment::factory()->create([
                'asset_id' => $asset->id,
                'employee_id' => $employee->id,
                'assigned_by' => $manager->id,
                'unassigned_at' => null,
            ]);
        }

        $this->actingAs($manager)
            ->getJson('/api/assets?per_page=1&page=2')
            ->assertOk()
            ->assertJsonPath('pagination.per_page', 1)
            ->assertJsonPath('summary.total', 7)
            ->assertJsonPath('summary.available', 3)
            ->assertJsonPath('summary.assigned', 2)
            ->assertJsonPath('summary.maintenance', 1)
            ->assertJsonPath('summary.inventorying', 1);
    }
}
