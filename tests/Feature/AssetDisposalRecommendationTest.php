<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetDisposalRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_asset_is_recommended_for_disposal_only_when_depreciation_is_above_75_percent(): void
    {
        $exactly75Percent = Asset::factory()->create([
            'purchase_cost' => 1000,
            'salvage_value' => 0,
            'useful_life_months' => 100,
            'purchase_date' => now()->subMonths(75),
        ]);
        $above75Percent = Asset::factory()->create([
            'purchase_cost' => 1000,
            'salvage_value' => 0,
            'useful_life_months' => 100,
            'purchase_date' => now()->subMonths(76),
        ]);

        $this->assertSame(75.0, $exactly75Percent->getDepreciationPercentage());
        $this->assertFalse($exactly75Percent->isEligibleForDisposal());
        $this->assertTrue($above75Percent->isEligibleForDisposal());
    }

    public function test_retiring_asset_clears_location_and_responsible_employee(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();
        $location = Location::factory()->create([
            'code' => 'LOC-DISPOSE',
            'name' => 'Kho thanh ly',
        ]);
        $asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
            'location_id' => $location->id,
            'location' => $location->name,
            'purchase_cost' => 1000,
            'salvage_value' => 0,
            'useful_life_months' => 24,
            'purchase_date' => now()->subMonths(30),
        ]);

        AssetAssignment::factory()->create([
            'asset_id' => $asset->id,
            'employee_id' => $employee->id,
            'department_name' => null,
            'assigned_by' => $manager->id,
            'assigned_at' => now()->subMonth(),
            'unassigned_at' => null,
        ]);

        $this->actingAs($manager)
            ->postJson("/api/disposal/assets/{$asset->id}/retire", [
                'reason' => 'Het vong doi su dung',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', Asset::STATUS_RETIRED)
            ->assertJsonPath('data.location', null)
            ->assertJsonPath('data.responsible_employee', null);

        $asset->refresh();

        $this->assertNull($asset->location_id);
        $this->assertNull($asset->location);
        $this->assertFalse($asset->isAssigned());
    }
}
