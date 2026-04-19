<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequestValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_review_request_route_returns_removed_scope_response(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);

        $this->actingAs($manager)
            ->getJson('/api/review-requests')
            ->assertStatus(410);
    }

    public function test_creating_legacy_request_returns_removed_scope_response(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($employee)
            ->postJson('/api/requests', [
                'type' => 'ASSET_LOAN',
                'title' => 'Legacy request',
            ])
            ->assertStatus(410);
    }
}
