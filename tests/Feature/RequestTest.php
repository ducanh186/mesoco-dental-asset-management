<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_request_workflow_routes_still_work_for_supported_types(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);

        $this->actingAs($manager)
            ->getJson('/api/requests')
            ->assertOk()
            ->assertJsonPath('available_types', ['JUSTIFICATION', 'CONSUMABLE_REQUEST'])
            ->assertJsonPath('available_statuses', ['SUBMITTED', 'APPROVED', 'REJECTED']);
    }

    public function test_request_tables_are_part_of_current_schema(): void
    {
        $this->assertTrue(Schema::hasTable('requests'));
        $this->assertTrue(Schema::hasTable('request_items'));
        $this->assertTrue(Schema::hasTable('request_events'));
    }
}
