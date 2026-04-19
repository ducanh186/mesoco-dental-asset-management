<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_request_workflow_routes_are_removed_from_main_scope(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($employee)
            ->getJson('/api/requests')
            ->assertStatus(410)
            ->assertJsonPath('message', 'Request workflow has been removed from the main product scope. Use purchase orders, maintenance, disposal, and inventory checks instead.');
    }

    public function test_request_tables_are_not_part_of_current_schema(): void
    {
        $this->assertFalse(Schema::hasTable('requests'));
        $this->assertFalse(Schema::hasTable('request_items'));
        $this->assertFalse(Schema::hasTable('request_events'));
    }
}
