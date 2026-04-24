<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Asset::class;

    /**
     * Asset code counter for unique generation.
     */
    protected static int $assetCodeCounter = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_code' => sprintf('EQUIP-%s-%04d', now()->format('Ym'), static::$assetCodeCounter++),
            'name' => fake()->words(3, true),
            'type' => fake()->randomElement(Asset::TYPES),
            'status' => Asset::STATUS_ACTIVE,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the asset is in maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Asset::STATUS_MAINTENANCE,
        ]);
    }

    /**
     * Indicate that the asset is retired.
     */
    public function retired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Asset::STATUS_RETIRED,
        ]);
    }

    /**
     * Indicate that the asset is off service.
     */
    public function offService(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Asset::STATUS_OFF_SERVICE,
        ]);
    }

    /**
     * Create an asset without asset_code (to test auto-generation).
     */
    public function withoutCode(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_code' => null,
        ]);
    }

    /**
     * Add valuation data (Phase 6).
     * Randomly generates purchase data for depreciation testing.
     */
    public function withValuation(): static
    {
        return $this->state(function (array $attributes) {
            $purchaseDate = fake()->dateTimeBetween('-5 years', '-6 months');
            $purchaseCost = fake()->randomFloat(2, 500, 100000);
            $usefulLifeMonths = fake()->randomElement([12, 24, 36, 48, 60, 84, 120]);
            $salvageValue = round($purchaseCost * fake()->randomFloat(2, 0.05, 0.15), 2);
            
            // Warranty typically 1-5 years from purchase
            $warrantyYears = fake()->numberBetween(1, 5);
            $warrantyExpiry = (clone $purchaseDate)->modify("+{$warrantyYears} years");
            
            return [
                'category' => fake()->randomElement(Asset::CATEGORIES),
                'location' => fake()->randomElement([
                    'Room 101', 'Room 102', 'Room 103', 'Room 104',
                    'IT Storage', 'Server Room', 'Engineering Area', 'Finance Office',
                    'Meeting Room A', 'Reception', 'Operations Office'
                ]),
                'purchase_date' => $purchaseDate,
                'purchase_cost' => $purchaseCost,
                'useful_life_months' => $usefulLifeMonths,
                'salvage_value' => $salvageValue,
                'depreciation_method' => Asset::DEPRECIATION_TIME,
                'warranty_expiry' => $warrantyExpiry,
            ];
        });
    }

    /**
     * Create a high-value IT asset.
     */
    public function highValue(): static
    {
        return $this->state(function (array $attributes) {
            $purchaseDate = fake()->dateTimeBetween('-3 years', '-1 year');
            $purchaseCost = fake()->randomFloat(2, 50000, 150000);
            
            return [
                'name' => fake()->randomElement([
                    'Dell PowerEdge Server',
                    'MacBook Pro Fleet Unit',
                    'Cisco Core Switch',
                    'Synology NAS Storage',
                    'Enterprise UPS System'
                ]),
                'type' => Asset::TYPE_MACHINE,
                'category' => 'Server',
                'location' => 'Server Room',
                'purchase_date' => $purchaseDate,
                'purchase_cost' => $purchaseCost,
                'useful_life_months' => 120,
                'salvage_value' => round($purchaseCost * 0.1, 2),
                'depreciation_method' => Asset::DEPRECIATION_TIME,
                'warranty_expiry' => (clone $purchaseDate)->modify('+5 years'),
            ];
        });
    }

    /**
     * Create a fully depreciated asset.
     */
    public function fullyDepreciated(): static
    {
        return $this->state(function (array $attributes) {
            $usefulLifeMonths = 24;
            $purchaseDate = now()->subMonths($usefulLifeMonths + 12); // Past useful life
            $purchaseCost = fake()->randomFloat(2, 1000, 5000);
            
            return [
                'category' => fake()->randomElement(Asset::CATEGORIES),
                'location' => 'Storage',
                'purchase_date' => $purchaseDate,
                'purchase_cost' => $purchaseCost,
                'useful_life_months' => $usefulLifeMonths,
                'salvage_value' => round($purchaseCost * 0.1, 2),
                'depreciation_method' => Asset::DEPRECIATION_TIME,
            ];
        });
    }
}
