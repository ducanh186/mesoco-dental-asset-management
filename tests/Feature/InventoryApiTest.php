<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\Employee;
use App\Models\InventoryCheck;
use App\Models\InventoryCheckItem;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 6: Inventory API Tests
 * Tests RBAC for inventory endpoints.
 */
class InventoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $hr;
    protected User $employee;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->admin = User::factory()->create(['role' => 'admin', 'must_change_password' => false]);
        $this->hr = User::factory()->create(['role' => 'hr', 'must_change_password' => false]);
        $this->employee = User::factory()->create(['role' => 'employee', 'must_change_password' => false]);
        $this->staff = User::factory()->create(['role' => 'staff', 'must_change_password' => false]);

        // Create some assets with valuation data
        Asset::factory()->count(3)->withValuation()->create();
        Asset::factory()->count(2)->maintenance()->withValuation()->create();
        Asset::factory()->count(1)->retired()->withValuation()->create();
    }

    // =========================================================================
    // GET /api/inventory/summary - Admin/HR only
    // =========================================================================

    public function test_admin_can_access_inventory_summary(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary' => [
                    'total_assets',
                    'by_status' => ['active', 'maintenance', 'off_service', 'retired'],
                    'by_assignment' => ['assigned', 'available'],
                    'by_category',
                ],
                'valuation' => [
                    'assets_with_valuation',
                    'total_purchase_cost',
                    'total_salvage_value',
                    'total_current_book_value',
                    'total_accumulated_depreciation',
                ],
                'available_types',
                'available_statuses',
                'available_categories',
            ]);
    }

    public function test_hr_can_access_inventory_summary(): void
    {
        $response = $this->actingAs($this->hr)->getJson('/api/inventory/summary');

        $response->assertStatus(200)
            ->assertJsonStructure(['summary', 'valuation']);
    }

    public function test_employee_cannot_access_inventory_summary(): void
    {
        $response = $this->actingAs($this->employee)->getJson('/api/inventory/summary');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_access_inventory_summary(): void
    {
        $response = $this->actingAs($this->staff)->getJson('/api/inventory/summary');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_inventory_summary(): void
    {
        $response = $this->getJson('/api/inventory/summary');

        $response->assertStatus(401);
    }

    // =========================================================================
    // GET /api/inventory/assets - Admin/HR only
    // =========================================================================

    public function test_admin_can_list_inventory_assets(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'assets',
                'pagination' => ['current_page', 'last_page', 'per_page', 'total'],
                'filters' => ['types', 'statuses', 'categories', 'locations'],
            ]);
    }

    public function test_hr_can_list_inventory_assets(): void
    {
        $response = $this->actingAs($this->hr)->getJson('/api/inventory/assets');

        $response->assertStatus(200)
            ->assertJsonStructure(['assets', 'pagination']);
    }

    public function test_employee_cannot_list_inventory_assets(): void
    {
        $response = $this->actingAs($this->employee)->getJson('/api/inventory/assets');

        $response->assertStatus(403);
    }

    public function test_inventory_assets_filters_by_status(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?status=maintenance');

        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        foreach ($assets as $asset) {
            $this->assertEquals('maintenance', $asset['status']);
        }
    }

    public function test_inventory_assets_filters_by_category(): void
    {
        // Create asset with specific category
        Asset::factory()->create([
            'category' => 'Server',
            'purchase_cost' => 10000,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?category=Server');

        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        foreach ($assets as $asset) {
            $this->assertEquals('Server', $asset['category']);
        }
    }

    public function test_inventory_assets_search_works(): void
    {
        Asset::factory()->create([
            'name' => 'UniqueTestMachine',
            'asset_code' => 'TEST-001',
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?search=UniqueTestMachine');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('assets'));
    }

    public function test_inventory_assets_pagination_works(): void
    {
        Asset::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?per_page=5');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('assets'));
        $this->assertGreaterThan(1, $response->json('pagination.last_page'));
    }

    // =========================================================================
    // GET /api/inventory/valuation - Admin/HR only
    // =========================================================================

    public function test_admin_can_access_valuation_report(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'assets' => [
                    '*' => [
                        'id',
                        'asset_code',
                        'name',
                        'valuation' => [
                            'purchase_date',
                            'purchase_cost',
                            'useful_life_months',
                            'salvage_value',
                            'monthly_depreciation',
                            'months_in_service',
                            'accumulated_depreciation',
                            'current_book_value',
                            'is_fully_depreciated',
                        ],
                    ],
                ],
                'pagination',
            ]);
    }

    public function test_hr_can_access_valuation_report(): void
    {
        $response = $this->actingAs($this->hr)->getJson('/api/inventory/valuation');

        $response->assertStatus(200);
    }

    public function test_employee_cannot_access_valuation_report(): void
    {
        $response = $this->actingAs($this->employee)->getJson('/api/inventory/valuation');

        $response->assertStatus(403);
    }

    public function test_valuation_report_only_includes_assets_with_purchase_cost(): void
    {
        // Create asset without valuation
        Asset::factory()->create([
            'purchase_cost' => null,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation');

        $response->assertStatus(200);
        
        // All returned assets should have valuation data
        $assets = $response->json('assets');
        foreach ($assets as $asset) {
            $this->assertNotNull($asset['valuation']['purchase_cost']);
        }
    }

    public function test_valuation_fully_depreciated_filter_returns_correct_assets(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create a fully depreciated asset (purchased long ago, short useful life)
        $fullyDepreciated = Asset::factory()->create([
            'purchase_cost' => 1000,
            'useful_life_months' => 1, // 1 month useful life
            'salvage_value' => 100,
            'purchase_date' => now()->subMonths(24), // 24 months ago
        ]);

        // Create a not fully depreciated asset (recently purchased, long useful life)
        $notFullyDepreciated = Asset::factory()->create([
            'purchase_cost' => 5000,
            'useful_life_months' => 120, // 10 years
            'salvage_value' => 500,
            'purchase_date' => now()->subMonths(1), // 1 month ago
        ]);

        // Test filter for fully depreciated = true
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation?fully_depreciated=true');
        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        $this->assertCount(1, $assets);
        $this->assertEquals($fullyDepreciated->id, $assets[0]['id']);
        $this->assertTrue($assets[0]['valuation']['is_fully_depreciated']);

        // Test filter for fully depreciated = false
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation?fully_depreciated=false');
        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        $this->assertCount(1, $assets);
        $this->assertEquals($notFullyDepreciated->id, $assets[0]['id']);
        $this->assertFalse($assets[0]['valuation']['is_fully_depreciated']);
    }

    public function test_valuation_fully_depreciated_filter_pagination_is_correct(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create 5 fully depreciated assets
        for ($i = 0; $i < 5; $i++) {
            Asset::factory()->create([
                'purchase_cost' => 1000,
                'useful_life_months' => 1,
                'salvage_value' => 100,
                'purchase_date' => now()->subMonths(24),
            ]);
        }

        // Create 3 not fully depreciated assets
        for ($i = 0; $i < 3; $i++) {
            Asset::factory()->create([
                'purchase_cost' => 5000,
                'useful_life_months' => 120,
                'salvage_value' => 500,
                'purchase_date' => now()->subMonths(1),
            ]);
        }

        // Test pagination for fully depreciated - should show correct total
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation?fully_depreciated=true&per_page=2');
        $response->assertStatus(200);
        
        $pagination = $response->json('pagination');
        $this->assertEquals(5, $pagination['total']);
        $this->assertEquals(3, $pagination['last_page']);
        $this->assertCount(2, $response->json('assets'));

        // Test pagination for not fully depreciated
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/valuation?fully_depreciated=false&per_page=2');
        $response->assertStatus(200);
        
        $pagination = $response->json('pagination');
        $this->assertEquals(3, $pagination['total']);
        $this->assertEquals(2, $pagination['last_page']);
    }

    // =========================================================================
    // GET /api/inventory/export - CSV Export (Admin/HR only)
    // =========================================================================

    public function test_admin_can_export_inventory_csv(): void
    {
        $response = $this->actingAs($this->admin)->get('/api/inventory/export');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        
        // Get streamed content
        $content = $response->streamedContent();
        
        // Check CSV header row exists
        $this->assertStringContainsString('Asset Code', $content);
        $this->assertStringContainsString('Name', $content);
        $this->assertStringContainsString('Category', $content);
        $this->assertStringContainsString('Status', $content);
        $this->assertStringContainsString('Purchase Cost', $content);
    }

    public function test_hr_can_export_inventory_csv(): void
    {
        $response = $this->actingAs($this->hr)->get('/api/inventory/export');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_employee_cannot_export_inventory_csv(): void
    {
        $response = $this->actingAs($this->employee)->get('/api/inventory/export');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_export_inventory_csv(): void
    {
        $response = $this->actingAs($this->staff)->get('/api/inventory/export');

        $response->assertStatus(403);
    }

    public function test_export_csv_respects_filters(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create test assets with different statuses
        Asset::factory()->create([
            'asset_code' => 'ACTIVE-001',
            'name' => 'Active Machine',
            'status' => 'active',
        ]);
        
        Asset::factory()->create([
            'asset_code' => 'MAINT-001',
            'name' => 'Maintenance Machine',
            'status' => 'maintenance',
        ]);

        // Export only active assets
        $response = $this->actingAs($this->admin)->get('/api/inventory/export?status=active');
        $response->assertStatus(200);
        
        $content = $response->streamedContent();
        
        // Should contain active asset
        $this->assertStringContainsString('ACTIVE-001', $content);
        $this->assertStringContainsString('Active Machine', $content);
        
        // Should NOT contain maintenance asset
        $this->assertStringNotContainsString('MAINT-001', $content);
        $this->assertStringNotContainsString('Maintenance Machine', $content);
    }

    public function test_export_csv_has_correct_row_count(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create 3 assets
        Asset::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get('/api/inventory/export');
        $response->assertStatus(200);
        
        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));
        
        // Should have header + 3 data rows
        $this->assertCount(4, $lines);
    }

    // =========================================================================
    // Warranty Status Tests
    // =========================================================================

    public function test_inventory_summary_includes_warranty_stats(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/inventory/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary',
                'valuation',
                'warranty' => [
                    'expiring_soon_count',
                    'expired_count',
                    'valid_count',
                    'threshold_days',
                ],
            ]);
    }

    public function test_inventory_assets_include_warranty_fields(): void
    {
        // Create asset with warranty
        Asset::factory()->create([
            'warranty_expiry' => now()->addDays(15), // Expiring soon
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets');

        $response->assertStatus(200);
        
        $asset = $response->json('assets.0');
        $this->assertArrayHasKey('warranty_status', $asset);
        $this->assertArrayHasKey('warranty_days_left', $asset);
        $this->assertArrayHasKey('is_warranty_expiring_soon', $asset);
    }

    public function test_warranty_expiring_soon_filter_works(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create asset with warranty expiring soon (within 30 days)
        Asset::factory()->create([
            'asset_code' => 'EXPIRING-001',
            'warranty_expiry' => now()->addDays(15),
        ]);

        // Create asset with valid warranty (more than 30 days)
        Asset::factory()->create([
            'asset_code' => 'VALID-001',
            'warranty_expiry' => now()->addDays(60),
        ]);

        // Create asset with no warranty
        Asset::factory()->create([
            'asset_code' => 'NO-WARRANTY-001',
            'warranty_expiry' => null,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?warranty_expiring_soon=true');

        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        $this->assertCount(1, $assets);
        $this->assertEquals('EXPIRING-001', $assets[0]['asset_code']);
        $this->assertTrue($assets[0]['is_warranty_expiring_soon']);
    }

    public function test_warranty_counts_are_correct_in_summary(): void
    {
        // Clean slate
        Asset::query()->forceDelete();
        
        // Create 2 assets with warranty expiring soon
        Asset::factory()->count(2)->create([
            'warranty_expiry' => now()->addDays(15),
        ]);

        // Create 1 asset with expired warranty
        Asset::factory()->create([
            'warranty_expiry' => now()->subDays(5),
        ]);

        // Create 1 asset with valid warranty
        Asset::factory()->create([
            'warranty_expiry' => now()->addDays(60),
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/summary');

        $response->assertStatus(200);
        
        $warranty = $response->json('warranty');
        $this->assertEquals(2, $warranty['expiring_soon_count']);
        $this->assertEquals(1, $warranty['expired_count']);
        $this->assertEquals(3, $warranty['valid_count']); // 2 expiring soon + 1 valid = 3 (expiring soon is subset of valid)
    }

    public function test_technician_can_create_inventory_check_with_detail_items(): void
    {
        Asset::query()->forceDelete();
        $asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
            'location' => 'Room A',
        ]);

        $response = $this->actingAs($this->hr)->postJson('/api/inventory/checks', [
            'title' => 'Room A inventory',
            'location' => 'Room A',
            'asset_ids' => [$asset->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', InventoryCheck::STATUS_IN_PROGRESS)
            ->assertJsonPath('data.items_count', 1);

        $this->assertDatabaseHas('inventory_check_items', [
            'asset_id' => $asset->id,
            'expected_status' => Asset::STATUS_ACTIVE,
            'expected_location' => 'Room A',
            'result' => InventoryCheckItem::RESULT_PENDING,
        ]);
    }

    public function test_can_update_and_complete_inventory_check(): void
    {
        Asset::query()->forceDelete();
        $asset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
            'location' => 'Room B',
        ]);

        $createResponse = $this->actingAs($this->admin)->postJson('/api/inventory/checks', [
            'asset_ids' => [$asset->id],
        ]);

        $checkId = $createResponse->json('data.id');
        $itemId = InventoryCheckItem::query()->where('inventory_check_id', $checkId)->value('id');

        $this->actingAs($this->admin)
            ->patchJson("/api/inventory/checks/{$checkId}/items/{$itemId}", [
                'actual_status' => Asset::STATUS_ACTIVE,
                'actual_location' => 'Room B',
            ])
            ->assertOk()
            ->assertJsonPath('data.result', InventoryCheckItem::RESULT_MATCHED);

        $this->actingAs($this->admin)
            ->postJson("/api/inventory/checks/{$checkId}/complete")
            ->assertOk()
            ->assertJsonPath('data.status', InventoryCheck::STATUS_COMPLETED);
    }
}
