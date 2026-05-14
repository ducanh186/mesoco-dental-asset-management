<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLatestErdFieldTest extends TestCase
{
    use RefreshDatabase;

    public function test_asset_categories_match_current_it_device_catalog(): void
    {
        $this->assertSame([
            'PC',
            'Màn hình',
            'Thiết bị Test',
            'Phụ kiện dùng',
            'Linh kiện thay thế',
            'RAM',
            'SSD',
            'HDD',
            'Tai nghe',
            'Adapter',
            'Cáp kết nối',
            'Mainboard',
            'Bộ nguồn',
        ], Asset::CATEGORIES);
    }

    public function test_store_accepts_latest_erd_asset_alias_fields(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);

        $response = $this->actingAs($manager)->postJson('/api/assets', [
            'name' => 'ThinkPad T14 Gen 5',
            'type' => Asset::TYPE_EQUIPMENT,
            'status' => Asset::ERD_STATUS_AVAILABLE,
            'serial_number' => 'SN-T14-0001',
            'qr_code' => 'QR-T14-0001',
            'model' => 'ThinkPad T14 Gen 5',
            'configuration' => 'Core Ultra 7 / 32GB RAM / 1TB SSD',
            'purchase_price' => 42000000,
            'current_depreciation_rate' => 0.125,
            'warranty_expiry' => '2028-05-11',
        ]);

        $response->assertCreated()
            ->assertJsonPath('asset.serial_number', 'SN-T14-0001')
            ->assertJsonPath('asset.qr_code', 'QR-T14-0001')
            ->assertJsonPath('asset.model', 'ThinkPad T14 Gen 5')
            ->assertJsonPath('asset.configuration', 'Core Ultra 7 / 32GB RAM / 1TB SSD')
            ->assertJsonPath('asset.current_depreciation_rate', 0.125)
            ->assertJsonPath('asset.lifecycle_status', Asset::ERD_STATUS_AVAILABLE)
            ->assertJsonPath('asset.status', Asset::STATUS_ACTIVE);

        $this->assertEquals(42000000, $response->json('asset.purchase_price'));

        $this->assertDatabaseHas('assets', [
            'serial_number' => 'SN-T14-0001',
            'qr_code' => 'QR-T14-0001',
            'model' => 'ThinkPad T14 Gen 5',
            'configuration' => 'Core Ultra 7 / 32GB RAM / 1TB SSD',
            'purchase_cost' => 42000000,
            'purchase_price' => 42000000,
            'depreciation_rate' => 0.125,
            'current_depreciation_rate' => 0.125,
            'status' => Asset::STATUS_ACTIVE,
        ]);
    }

    public function test_update_accepts_latest_erd_status_and_price_aliases(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
            'purchase_cost' => 1000000,
        ]);

        $response = $this->actingAs($manager)->putJson("/api/assets/{$asset->id}", [
            'status' => Asset::ERD_STATUS_REPAIRING,
            'purchase_price' => 1500000,
            'current_depreciation_rate' => 0.35,
            'serial_number' => 'SN-UPDATED-001',
            'qr_code' => 'QR-UPDATED-001',
            'model' => 'Dell Latitude 9450',
            'configuration' => 'Intel Core Ultra 5 / 16GB RAM / 512GB SSD',
        ]);

        $response->assertOk()
            ->assertJsonPath('asset.status', Asset::STATUS_MAINTENANCE)
            ->assertJsonPath('asset.lifecycle_status', Asset::ERD_STATUS_REPAIRING)
            ->assertJsonPath('asset.current_depreciation_rate', 0.35)
            ->assertJsonPath('asset.serial_number', 'SN-UPDATED-001')
            ->assertJsonPath('asset.qr_code', 'QR-UPDATED-001');

        $this->assertEquals(1500000, $response->json('asset.purchase_price'));

        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'status' => Asset::STATUS_MAINTENANCE,
            'purchase_cost' => 1500000,
            'purchase_price' => 1500000,
            'depreciation_rate' => 0.35,
            'current_depreciation_rate' => 0.35,
            'serial_number' => 'SN-UPDATED-001',
            'qr_code' => 'QR-UPDATED-001',
            'model' => 'Dell Latitude 9450',
        ]);
    }
}
