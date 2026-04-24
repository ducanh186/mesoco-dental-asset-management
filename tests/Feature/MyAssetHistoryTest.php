<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyAssetHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_my_asset_history_route_returns_gone_for_authenticated_user(): void
    {
        $user = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($user)
            ->getJson('/api/my-asset-history')
            ->assertStatus(410);
    }

    public function test_my_asset_history_summary_route_returns_gone(): void
    {
        $user = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($user)
            ->getJson('/api/my-asset-history/summary')
            ->assertStatus(410);
    }

    public function test_unauthenticated_user_still_gets_unauthorized_for_legacy_routes(): void
    {
        $this->getJson('/api/my-asset-history')
            ->assertStatus(401);
    }
}
