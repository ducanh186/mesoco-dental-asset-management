<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCodeSequence;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AssetCodeGenerationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function asset_created_without_code_generates_unique_code()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/assets', [
                'name' => 'Test Asset',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                // Note: no asset_code provided
            ]);

        $response->assertCreated();

        $asset = Asset::find($response->json('asset.id'));
        
        // Should have auto-generated code with correct format
        $this->assertMatchesRegularExpression(
            '/^EQUIP-\d{6}-\d{4}$/',
            $asset->asset_code
        );
        
        // Should start with current year/month
        $expectedPrefix = 'EQUIP-' . now()->format('Ym') . '-';
        $this->assertStringStartsWith($expectedPrefix, $asset->asset_code);
    }

    /** @test */
    public function asset_created_with_code_keeps_provided_code()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/assets', [
                'asset_code' => 'CUSTOM-001',
                'name' => 'Test Asset',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
            ]);

        $response->assertCreated();

        $asset = Asset::find($response->json('asset.id'));
        $this->assertEquals('CUSTOM-001', $asset->asset_code);
    }

    /** @test */ 
    public function sequential_assets_get_incremental_codes()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create first asset
        $response1 = $this->actingAs($admin)
            ->postJson('/api/assets', [
                'name' => 'Asset 1',
                'type' => Asset::TYPE_EQUIPMENT,
            ]);

        // Create second asset
        $response2 = $this->actingAs($admin)
            ->postJson('/api/assets', [
                'name' => 'Asset 2', 
                'type' => Asset::TYPE_EQUIPMENT,
            ]);

        $asset1 = Asset::find($response1->json('asset.id'));
        $asset2 = Asset::find($response2->json('asset.id'));

        $expectedPrefix = 'EQUIP-' . now()->format('Ym') . '-';
        
        $this->assertEquals($expectedPrefix . '0001', $asset1->asset_code);
        $this->assertEquals($expectedPrefix . '0002', $asset2->asset_code);
    }

    /** @test */
    public function sequence_table_generates_atomic_codes()
    {
        $yearMonth = now()->format('Ym');
        
        // Generate first code
        $code1 = AssetCodeSequence::generateNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0001", $code1);
        
        // Generate second code
        $code2 = AssetCodeSequence::generateNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0002", $code2);
        
        // Verify sequence record
        $sequence = AssetCodeSequence::where('prefix', 'EQUIP')
            ->where('year_month', $yearMonth)
            ->first();
            
        $this->assertEquals(2, $sequence->last_number);
    }

    /** @test */
    public function sequence_resets_for_new_month()
    {
        $yearMonth = now()->format('Ym');
        
        // Create sequence for current month with high number
        AssetCodeSequence::create([
            'prefix' => 'EQUIP',
            'year_month' => $yearMonth,
            'last_number' => 999,
        ]);
        
        // Generate should continue from 1000
        $code = AssetCodeSequence::generateNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-1000", $code);
        
        // If we had a different month, it would start fresh
        $futureMonth = now()->addMonth()->format('Ym');
        AssetCodeSequence::create([
            'prefix' => 'EQUIP',
            'year_month' => $futureMonth,
            'last_number' => 0,
        ]);
        
        $futureSequence = AssetCodeSequence::where('prefix', 'EQUIP')
            ->where('year_month', $futureMonth)
            ->first();
            
        $this->assertEquals(0, $futureSequence->last_number);
    }

    /** @test */
    public function peek_next_code_does_not_increment()
    {
        $yearMonth = now()->format('Ym');
        
        // Peek should show next code without incrementing
        $preview1 = AssetCodeSequence::peekNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0001", $preview1);
        
        // Peek again should show same code
        $preview2 = AssetCodeSequence::peekNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0001", $preview2);
        
        // Actually generate should also be 0001
        $actual = AssetCodeSequence::generateNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0001", $actual);
        
        // Now peek should show 0002
        $preview3 = AssetCodeSequence::peekNextCode('EQUIP');
        $this->assertEquals("EQUIP-{$yearMonth}-0002", $preview3);
    }

    /** @test */
    public function concurrent_asset_creation_produces_unique_codes()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Create multiple assets sequentially (simulating concurrent in test)
        $createdAssets = [];
        
        for ($i = 0; $i < 5; $i++) {
            $response = $this->actingAs($admin)
                ->postJson('/api/assets', [
                    'name' => "Concurrent Asset $i",
                    'type' => Asset::TYPE_EQUIPMENT,
                ]);
            
            $createdAssets[] = $response->json('asset.asset_code');
        }

        // All asset codes should be unique
        $this->assertCount(5, array_unique($createdAssets));

        // All should match the expected pattern
        $yearMonth = now()->format('Ym');
        foreach ($createdAssets as $index => $code) {
            $expectedCode = sprintf('EQUIP-%s-%04d', $yearMonth, $index + 1);
            $this->assertEquals($expectedCode, $code);
        }
    }

    /** @test */
    public function duplicate_asset_code_returns_validation_error()
    {
        Asset::factory()->create(['asset_code' => 'DUPLICATE-001']);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson('/api/assets', [
                'asset_code' => 'DUPLICATE-001',
                'name' => 'Test Asset',
                'type' => Asset::TYPE_EQUIPMENT,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['asset_code']);
    }

    /** @test */
    public function different_prefixes_maintain_separate_sequences()
    {
        $yearMonth = now()->format('Ym');
        
        // Generate codes for different prefixes
        $equip1 = AssetCodeSequence::generateNextCode('EQUIP');
        $tool1 = AssetCodeSequence::generateNextCode('TOOL');
        $equip2 = AssetCodeSequence::generateNextCode('EQUIP');
        
        $this->assertEquals("EQUIP-{$yearMonth}-0001", $equip1);
        $this->assertEquals("TOOL-{$yearMonth}-0001", $tool1);
        $this->assertEquals("EQUIP-{$yearMonth}-0002", $equip2);
    }
}
