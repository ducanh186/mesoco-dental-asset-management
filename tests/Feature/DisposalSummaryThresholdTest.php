<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisposalSummaryThresholdTest extends TestCase
{
    use RefreshDatabase;

    public function test_disposal_summary_uses_75_percent_threshold_for_recommendation_count(): void
    {
        $manager = User::factory()->manager()->create();

        Asset::factory()->create([
            'purchase_cost' => 1000,
            'purchase_price' => 1000,
            'useful_life_months' => 100,
            'salvage_value' => 0,
            'purchase_date' => now()->subMonths(80),
            'status' => Asset::STATUS_ACTIVE,
        ]);

        Asset::factory()->create([
            'purchase_cost' => 1000,
            'purchase_price' => 1000,
            'useful_life_months' => 100,
            'salvage_value' => 0,
            'purchase_date' => now()->subMonths(70),
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $this->actingAs($manager)
            ->getJson('/api/disposal/summary')
            ->assertOk()
            ->assertJsonPath('eligible_for_disposal', 1)
            ->assertJsonPath('high_depreciation', 1);
    }

    public function test_disposal_summary_includes_assets_at_exactly_75_percent_depreciation(): void
    {
        $manager = User::factory()->manager()->create();

        Asset::factory()->create([
            'purchase_cost' => 1000,
            'purchase_price' => 1000,
            'useful_life_months' => 100,
            'salvage_value' => 0,
            'purchase_date' => now()->subMonths(75),
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $this->actingAs($manager)
            ->getJson('/api/disposal/summary')
            ->assertOk()
            ->assertJsonPath('eligible_for_disposal', 1)
            ->assertJsonPath('high_depreciation', 1);
    }
}
