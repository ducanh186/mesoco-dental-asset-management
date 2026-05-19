<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\Assignment;
use App\Models\Location;
use App\Models\Supplier;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeatureDemoDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_feature_demo_data_matches_current_device_catalog_scope(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertGreaterThanOrEqual(30, Location::query()->where('is_active', true)->count());
        $this->assertDatabaseHas('locations', ['code' => null, 'name' => 'Bàn 1 - Kho tầng 1']);
        $this->assertDatabaseHas('locations', ['code' => null, 'name' => 'Bàn 8 - Kho tầng 3']);

        foreach (['RAM', 'SSD', 'HDD', 'Tai nghe', 'Adapter', 'Cáp kết nối', 'Mainboard', 'Bộ nguồn'] as $category) {
            $this->assertArrayHasKey($category, Asset::CATEGORY_PARENT_MAP);
            $this->assertDatabaseHas('assets', ['category' => $category]);
        }

        $this->assertSame(30, AssetRequest::query()->where('code', 'like', 'DEMO-REQ-%')->count());
        $this->assertGreaterThanOrEqual(20, Assignment::query()->where('note', 'like', 'Demo bàn giao%')->count());
        $this->assertGreaterThanOrEqual(5, Assignment::query()
            ->where('note', 'like', 'Demo bàn giao%')
            ->whereHas('returnRecord')
            ->count());
        $this->assertSame(
            [
                AssetRequest::STATUS_APPROVED,
                AssetRequest::STATUS_REJECTED,
                AssetRequest::STATUS_SUBMITTED,
            ],
            AssetRequest::query()
                ->where('code', 'like', 'DEMO-REQ-%')
                ->distinct()
                ->orderBy('status')
                ->pluck('status')
                ->all()
        );
        $demoRequests = AssetRequest::query()
            ->where('code', 'like', 'DEMO-REQ-%')
            ->orderBy('code')
            ->get();

        $this->assertEqualsCanonicalizing(
            ['Bàn giao', 'Thu hồi', 'Sửa chữa', 'Thu hủy'],
            $demoRequests
                ->map(fn (AssetRequest $request) => $request->toApiArray(false)['workflow_label'] ?? null)
                ->unique()
                ->values()
                ->all()
        );

        foreach ($demoRequests as $request) {
            $this->assertGreaterThanOrEqual('2026-05-06', $request->created_at->toDateString());
            $this->assertLessThanOrEqual('2026-05-13', $request->created_at->toDateString());
        }

        $this->assertDatabaseHas('suppliers', [
            'code' => 'NCC-001',
            'name' => 'Công ty Thiết bị CNTT ABC',
        ]);
        $this->assertGreaterThanOrEqual(10, Supplier::query()->where('code', 'like', 'NCC-%')->count());
    }
}
