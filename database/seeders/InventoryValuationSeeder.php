<?php

namespace Database\Seeders;

use App\Models\Asset;
use Illuminate\Database\Seeder;

/**
 * Seed valuation data for IT assets and create demo IT inventory records.
 */
class InventoryValuationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding inventory valuation data...');

        // Update existing assets with valuation data
        $this->updateExistingAssets();

        // Create additional demo assets with varied valuation
        $this->createDemoAssets();

        $this->command->info('Inventory valuation seeding complete!');
    }

    /**
     * Update existing assets with valuation data.
     */
    private function updateExistingAssets(): void
    {
        $assets = Asset::whereNull('purchase_cost')->get();
        $updated = 0;

        foreach ($assets as $asset) {
            $this->assignValuationByType($asset);
            $asset->save();
            $updated++;
        }

        $this->command->info("Updated {$updated} existing assets with valuation data.");
    }

    /**
     * Assign valuation data based on asset type.
     */
    private function assignValuationByType(Asset $asset): void
    {
        $valuationProfiles = [
            Asset::TYPE_MACHINE => [
                'category' => 'Server',
                'cost_range' => [20000, 150000],
                'life_months' => 120,
                'salvage_pct' => 0.10,
                'warranty_years' => 5,
            ],
            Asset::TYPE_EQUIPMENT => [
                'category' => 'Laptop',
                'cost_range' => [800, 35000],
                'life_months' => 60,
                'salvage_pct' => 0.10,
                'warranty_years' => 3,
            ],
            Asset::TYPE_TOOL => [
                'category' => 'Peripheral',
                'cost_range' => [50, 3000],
                'life_months' => 36,
                'salvage_pct' => 0.05,
                'warranty_years' => 2,
            ],
            Asset::TYPE_TRAY => [
                'category' => 'Office IT',
                'cost_range' => [100, 1200],
                'life_months' => 24,
                'salvage_pct' => 0,
                'warranty_years' => 1,
            ],
            Asset::TYPE_OTHER => [
                'category' => 'Other',
                'cost_range' => [200, 2000],
                'life_months' => 48,
                'salvage_pct' => 0.05,
                'warranty_years' => 2,
            ],
        ];

        $profile = $valuationProfiles[$asset->type] ?? $valuationProfiles[Asset::TYPE_OTHER];
        
        $purchaseDate = fake()->dateTimeBetween('-4 years', '-6 months');
        $purchaseCost = fake()->randomFloat(2, $profile['cost_range'][0], $profile['cost_range'][1]);
        
        $asset->category = $profile['category'];
        $asset->location = fake()->randomElement([
            'IT Storage', 'Server Room', 'Engineering Area',
            'Finance Office', 'Sales Office', 'Operations Office',
            'Meeting Room A', 'Reception'
        ]);
        $asset->purchase_date = $purchaseDate;
        $asset->purchase_cost = $purchaseCost;
        $asset->useful_life_months = $profile['life_months'];
        $asset->salvage_value = round($purchaseCost * $profile['salvage_pct'], 2);
        $asset->depreciation_method = Asset::DEPRECIATION_TIME;
        $asset->warranty_expiry = (clone $purchaseDate)->modify("+{$profile['warranty_years']} years");
    }

    /**
     * Create demo assets with specific valuation scenarios.
     */
    private function createDemoAssets(): void
    {
        // 1. High-value server/network equipment
        Asset::factory()
            ->count(2)
            ->highValue()
            ->create();

        // 2. Standard equipment with valuation
        Asset::factory()
            ->count(5)
            ->withValuation()
            ->create();

        // 3. Fully depreciated assets
        Asset::factory()
            ->count(2)
            ->fullyDepreciated()
            ->create();

        // 4. Assets in maintenance with valuation
        Asset::factory()
            ->count(2)
            ->maintenance()
            ->withValuation()
            ->create();

        // 5. Off-service assets
        Asset::factory()
            ->count(1)
            ->offService()
            ->withValuation()
            ->create();

        $this->command->info('Created 12 additional demo assets with valuation data.');
    }
}
