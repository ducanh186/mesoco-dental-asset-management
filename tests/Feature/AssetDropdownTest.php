<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetDropdownTest extends TestCase
{
    use RefreshDatabase;

    private User $doctor;
    private Employee $doctorEmployee;
    private User $admin;
    private Asset $assignedAsset;
    private Asset $unassignedAsset;

    protected function setUp(): void
    {
        parent::setUp();

        // Create employee first, then user with employee_id link
        $this->doctorEmployee = Employee::factory()->create([
            'employee_code' => 'DOC001',
            'full_name' => 'Dr. John Doe',
        ]);
        $this->doctor = User::factory()->create([
            'role' => 'doctor',
            'employee_id' => $this->doctorEmployee->id,
        ]);

        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);

        // Create assets
        $this->assignedAsset = Asset::factory()->create([
            'asset_code' => 'EQUIP-202601-0001',
            'name' => 'Dental Tool A',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $this->unassignedAsset = Asset::factory()->create([
            'asset_code' => 'EQUIP-202601-0002', 
            'name' => 'Dental Tool B',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        // Assign asset to doctor (assigned_by is required FK)
        AssetAssignment::create([
            'asset_id' => $this->assignedAsset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
        ]);
    }

    /** @test */
    public function doctor_can_only_see_assigned_assets_in_dropdown()
    {
        $response = $this->actingAs($this->doctor)
            ->getJson('/api/my-assigned-assets/dropdown');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'value' => $this->assignedAsset->id,
                'label' => 'EQUIP-202601-0001 - Dental Tool A',
                'asset_code' => 'EQUIP-202601-0001',
                'name' => 'Dental Tool A',
            ]);

        // Should not contain unassigned asset
        $response->assertJsonMissing([
            'value' => $this->unassignedAsset->id,
        ]);
    }

    /** @test */
    public function available_for_loan_contains_only_unassigned_assets()
    {
        $response = $this->actingAs($this->doctor)
            ->getJson('/api/assets/available-for-loan');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'value' => $this->unassignedAsset->id,
                'label' => 'EQUIP-202601-0002 - Dental Tool B',
                'asset_code' => 'EQUIP-202601-0002',
                'name' => 'Dental Tool B',
            ]);

        // Should not contain assigned asset
        $response->assertJsonMissing([
            'value' => $this->assignedAsset->id,
        ]);
    }

    /** @test */
    public function doctor_without_employee_record_gets_empty_dropdown()
    {
        $userWithoutEmployee = User::factory()->create(['role' => 'doctor']);

        $response = $this->actingAs($userWithoutEmployee)
            ->getJson('/api/my-assigned-assets/dropdown');

        $response->assertOk()
            ->assertJsonPath('data', []);
    }

    /** @test */
    public function inactive_assets_not_included_in_dropdowns()
    {
        // Create inactive assigned asset
        $inactiveAsset = Asset::factory()->create([
            'asset_code' => 'EQUIP-202601-0003',
            'name' => 'Broken Tool',
            'status' => Asset::STATUS_MAINTENANCE,
        ]);

        AssetAssignment::create([
            'asset_id' => $inactiveAsset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
        ]);

        // Check assigned dropdown
        $assignedResponse = $this->actingAs($this->doctor)
            ->getJson('/api/my-assigned-assets/dropdown');

        $assignedResponse->assertJsonMissing([
            'value' => $inactiveAsset->id,
        ]);

        // Create inactive unassigned asset
        $inactiveUnassigned = Asset::factory()->create([
            'asset_code' => 'EQUIP-202601-0004',
            'name' => 'Retired Tool',
            'status' => Asset::STATUS_RETIRED,
        ]);

        // Check available dropdown
        $availableResponse = $this->actingAs($this->doctor)
            ->getJson('/api/assets/available-for-loan');

        $availableResponse->assertJsonMissing([
            'value' => $inactiveUnassigned->id,
        ]);
    }

    /** @test */
    public function dropdown_label_handles_null_asset_code()
    {
        // Create asset without asset_code
        $assetWithoutCode = Asset::factory()->create([
            'asset_code' => null,
            'name' => 'No Code Asset',
            'status' => Asset::STATUS_ACTIVE,
        ]);

        // Assign to doctor
        AssetAssignment::create([
            'asset_id' => $assetWithoutCode->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($this->doctor)
            ->getJson('/api/my-assigned-assets/dropdown');

        $response->assertOk();
        
        // Label should fallback to name + ID when asset_code is null
        $assets = $response->json('data');
        $noCodeAsset = collect($assets)->firstWhere('value', $assetWithoutCode->id);
        
        $this->assertNotNull($noCodeAsset);
        $this->assertEquals("No Code Asset (ID: {$assetWithoutCode->id})", $noCodeAsset['label']);
    }

    /** @test */
    public function response_schema_is_consistent_between_endpoints()
    {
        // Both endpoints should return { data: [...] } structure
        $assignedResponse = $this->actingAs($this->doctor)
            ->getJson('/api/my-assigned-assets/dropdown');

        $loanResponse = $this->actingAs($this->doctor)
            ->getJson('/api/assets/available-for-loan');

        // Both should have 'data' key
        $this->assertArrayHasKey('data', $assignedResponse->json());
        $this->assertArrayHasKey('data', $loanResponse->json());

        // Check item structure if data is not empty
        if (!empty($assignedResponse->json('data'))) {
            $firstItem = $assignedResponse->json('data.0');
            $this->assertArrayHasKey('value', $firstItem);
            $this->assertArrayHasKey('label', $firstItem);
            $this->assertArrayHasKey('asset_code', $firstItem);
            $this->assertArrayHasKey('name', $firstItem);
            $this->assertArrayHasKey('type', $firstItem);
        }

        if (!empty($loanResponse->json('data'))) {
            $firstItem = $loanResponse->json('data.0');
            $this->assertArrayHasKey('value', $firstItem);
            $this->assertArrayHasKey('label', $firstItem);
            $this->assertArrayHasKey('asset_code', $firstItem);
            $this->assertArrayHasKey('name', $firstItem);
            $this->assertArrayHasKey('type', $firstItem);
        }
    }
}
