<?php

namespace Tests\Unit;

use App\Models\Asset;
use Carbon\Carbon;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Phase 6: Depreciation Calculation Unit Tests
 * Tests the straight-line time-based depreciation formula and edge cases
 */
class DepreciationCalculationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper to create a mock asset with valuation data
     */
    private function createAsset(array $attributes = []): Asset
    {
        return Asset::factory()->create(array_merge([
            'purchase_date' => Carbon::now()->subMonths(12),
            'purchase_cost' => 10000.00,
            'useful_life_months' => 60,
            'salvage_value' => 1000.00,
            'depreciation_method' => 'TIME',
            'category' => 'Equipment',
            'location' => 'Main Office',
        ], $attributes));
    }

    // =========================================================================
    // Monthly Depreciation Tests
    // =========================================================================

    public function test_calculates_monthly_depreciation_correctly(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
        ]);

        // (10000 - 1000) / 60 = 150
        $this->assertEquals(150.00, $asset->getMonthlyDepreciation());
    }

    public function test_monthly_depreciation_with_zero_salvage(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 12000.00,
            'salvage_value' => 0,
            'useful_life_months' => 48,
        ]);

        // 12000 / 48 = 250
        $this->assertEquals(250.00, $asset->getMonthlyDepreciation());
    }

    public function test_monthly_depreciation_returns_null_without_purchase_cost(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => null,
        ]);

        $this->assertNull($asset->getMonthlyDepreciation());
    }

    public function test_monthly_depreciation_returns_null_without_useful_life(): void
    {
        $asset = $this->createAsset([
            'useful_life_months' => null,
        ]);

        $this->assertNull($asset->getMonthlyDepreciation());
    }

    public function test_monthly_depreciation_returns_null_with_zero_useful_life(): void
    {
        $asset = $this->createAsset([
            'useful_life_months' => 0,
        ]);

        $this->assertNull($asset->getMonthlyDepreciation());
    }

    public function test_monthly_depreciation_returns_zero_when_salvage_equals_cost(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 5000.00,
            'salvage_value' => 5000.00,
            'useful_life_months' => 36,
        ]);

        $this->assertEquals(0, $asset->getMonthlyDepreciation());
    }

    // =========================================================================
    // Months in Service Tests
    // =========================================================================

    public function test_calculates_months_in_service_correctly(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(24),
        ]);

        $this->assertEquals(24, $asset->getMonthsInService());
    }

    public function test_months_in_service_returns_null_without_purchase_date(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => null,
        ]);

        $this->assertNull($asset->getMonthsInService());
    }

    public function test_months_in_service_returns_zero_for_future_purchase(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->addMonths(6),
        ]);

        $this->assertEquals(0, $asset->getMonthsInService());
    }

    public function test_months_in_service_with_custom_date(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::parse('2024-01-01'),
        ]);

        $asOf = Carbon::parse('2024-07-01');
        $this->assertEquals(6, $asset->getMonthsInService($asOf));
    }

    // =========================================================================
    // Accumulated Depreciation Tests
    // =========================================================================

    public function test_calculates_accumulated_depreciation_correctly(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(12),
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
        ]);

        // Monthly: (10000 - 1000) / 60 = 150
        // Accumulated: 150 * 12 = 1800
        $this->assertEquals(1800.00, $asset->getAccumulatedDepreciation());
    }

    public function test_accumulated_depreciation_caps_at_depreciable_amount(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(120), // 10 years
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60, // 5 years
        ]);

        // Max depreciation is purchase_cost - salvage = 9000
        // Even after 10 years, accumulated should cap at 9000
        $this->assertEquals(9000.00, $asset->getAccumulatedDepreciation());
    }

    public function test_accumulated_depreciation_returns_null_without_required_data(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => null,
        ]);

        $this->assertNull($asset->getAccumulatedDepreciation());
    }

    // =========================================================================
    // Current Book Value Tests
    // =========================================================================

    public function test_calculates_current_book_value_correctly(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(12),
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
        ]);

        // Accumulated: 1800 (from previous test)
        // Book value: 10000 - 1800 = 8200
        $this->assertEquals(8200.00, $asset->getCurrentBookValue());
    }

    public function test_book_value_never_goes_below_salvage(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(120), // Way past useful life
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
        ]);

        // Should be salvage value, not negative
        $this->assertEquals(1000.00, $asset->getCurrentBookValue());
    }

    public function test_book_value_equals_purchase_cost_without_depreciation_data(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 5000.00,
            'useful_life_months' => null, // Missing depreciation data
        ]);

        // Returns purchase cost when can't calculate depreciation
        $this->assertEquals(5000.00, $asset->getCurrentBookValue());
    }

    public function test_book_value_returns_null_without_purchase_cost(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => null,
        ]);

        $this->assertNull($asset->getCurrentBookValue());
    }

    public function test_book_value_with_custom_date(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::parse('2024-01-01'),
            'purchase_cost' => 12000.00,
            'salvage_value' => 0,
            'useful_life_months' => 48,
        ]);

        // Monthly: 12000 / 48 = 250
        // At 2024-07-01 (6 months): accumulated = 1500
        // Book value: 12000 - 1500 = 10500
        $asOf = Carbon::parse('2024-07-01');
        $this->assertEquals(10500.00, $asset->getCurrentBookValue($asOf));
    }

    // =========================================================================
    // Fully Depreciated Tests
    // =========================================================================

    public function test_detects_fully_depreciated_asset(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(72), // 6 years
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60, // 5 years
        ]);

        $this->assertTrue($asset->isFullyDepreciated());
    }

    public function test_not_fully_depreciated_within_useful_life(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(12),
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
        ]);

        $this->assertFalse($asset->isFullyDepreciated());
    }

    // =========================================================================
    // Remaining Useful Life Tests
    // =========================================================================

    public function test_calculates_remaining_useful_life(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(12),
            'useful_life_months' => 60,
        ]);

        // 60 - 12 = 48 months remaining
        $this->assertEquals(48, $asset->getRemainingUsefulLifeMonths());
    }

    public function test_remaining_useful_life_never_negative(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(72),
            'useful_life_months' => 60,
        ]);

        // Should be 0, not -12
        $this->assertEquals(0, $asset->getRemainingUsefulLifeMonths());
    }

    public function test_remaining_useful_life_returns_null_without_useful_life(): void
    {
        $asset = $this->createAsset([
            'useful_life_months' => null,
        ]);

        $this->assertNull($asset->getRemainingUsefulLifeMonths());
    }

    // =========================================================================
    // Valuation Data Array Tests
    // =========================================================================

    public function test_valuation_data_includes_all_fields(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::parse('2024-01-15'),
            'purchase_cost' => 10000.00,
            'salvage_value' => 1000.00,
            'useful_life_months' => 60,
            'depreciation_method' => 'TIME',
            'warranty_expiry' => Carbon::parse('2027-01-15'),
        ]);

        $data = $asset->getValuationData(Carbon::parse('2025-01-15'));

        $this->assertArrayHasKey('purchase_date', $data);
        $this->assertArrayHasKey('purchase_cost', $data);
        $this->assertArrayHasKey('useful_life_months', $data);
        $this->assertArrayHasKey('salvage_value', $data);
        $this->assertArrayHasKey('depreciation_method', $data);
        $this->assertArrayHasKey('warranty_expiry', $data);
        $this->assertArrayHasKey('months_in_service', $data);
        $this->assertArrayHasKey('monthly_depreciation', $data);
        $this->assertArrayHasKey('accumulated_depreciation', $data);
        $this->assertArrayHasKey('current_book_value', $data);
        $this->assertArrayHasKey('remaining_useful_life_months', $data);
        $this->assertArrayHasKey('is_fully_depreciated', $data);

        $this->assertEquals('2024-01-15', $data['purchase_date']);
        $this->assertEquals(10000.00, $data['purchase_cost']);
        $this->assertEquals(12, $data['months_in_service']);
        $this->assertEquals(150.00, $data['monthly_depreciation']);
        $this->assertEquals(1800.00, $data['accumulated_depreciation']);
        $this->assertEquals(8200.00, $data['current_book_value']);
        $this->assertEquals(48, $data['remaining_useful_life_months']);
        $this->assertFalse($data['is_fully_depreciated']);
    }

    // =========================================================================
    // Edge Cases
    // =========================================================================

    public function test_handles_decimal_precision_correctly(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 9999.99,
            'salvage_value' => 999.99,
            'useful_life_months' => 36,
        ]);

        // (9999.99 - 999.99) / 36 = 250
        $this->assertEquals(250.00, $asset->getMonthlyDepreciation());
    }

    public function test_handles_large_values(): void
    {
        $asset = $this->createAsset([
            'purchase_date' => Carbon::now()->subMonths(24),
            'purchase_cost' => 1000000.00, // $1M
            'salvage_value' => 100000.00,
            'useful_life_months' => 120, // 10 years
        ]);

        // Monthly: 900000 / 120 = 7500
        // Accumulated: 7500 * 24 = 180000
        // Book value: 1000000 - 180000 = 820000
        $this->assertEquals(7500.00, $asset->getMonthlyDepreciation());
        $this->assertEquals(180000.00, $asset->getAccumulatedDepreciation());
        $this->assertEquals(820000.00, $asset->getCurrentBookValue());
    }

    public function test_handles_very_short_useful_life(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 1200.00,
            'salvage_value' => 0,
            'useful_life_months' => 1,
        ]);

        // 1200 / 1 = 1200
        $this->assertEquals(1200.00, $asset->getMonthlyDepreciation());
    }

    public function test_handles_very_long_useful_life(): void
    {
        $asset = $this->createAsset([
            'purchase_cost' => 500000.00,
            'salvage_value' => 50000.00,
            'useful_life_months' => 360, // 30 years
        ]);

        // (500000 - 50000) / 360 = 1250
        $this->assertEquals(1250.00, $asset->getMonthlyDepreciation());
    }
}
