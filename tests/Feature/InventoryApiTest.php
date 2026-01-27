<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 6: Inventory API Tests
 * Tests RBAC for inventory endpoints (admin/hr only)
 */
class InventoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $hr;
    protected User $doctor;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->admin = User::factory()->create(['role' => 'admin', 'must_change_password' => false]);
        $this->hr = User::factory()->create(['role' => 'hr', 'must_change_password' => false]);
        $this->doctor = User::factory()->create(['role' => 'doctor', 'must_change_password' => false]);
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

    public function test_doctor_cannot_access_inventory_summary(): void
    {
        $response = $this->actingAs($this->doctor)->getJson('/api/inventory/summary');

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

    public function test_doctor_cannot_list_inventory_assets(): void
    {
        $response = $this->actingAs($this->doctor)->getJson('/api/inventory/assets');

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
            'category' => 'Imaging',
            'purchase_cost' => 10000,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/inventory/assets?category=Imaging');

        $response->assertStatus(200);
        
        $assets = $response->json('assets');
        foreach ($assets as $asset) {
            $this->assertEquals('Imaging', $asset['category']);
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

    public function test_doctor_cannot_access_valuation_report(): void
    {
        $response = $this->actingAs($this->doctor)->getJson('/api/inventory/valuation');

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
}
