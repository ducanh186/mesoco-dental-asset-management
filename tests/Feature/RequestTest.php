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
        $employee = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($employee)
            ->getJson('/api/requests')
            ->assertOk()
            ->assertJsonPath('available_types', ['JUSTIFICATION', 'CONSUMABLE_REQUEST']);
    }

    public function test_request_tables_are_not_part_of_current_schema(): void
    {
        $this->assertFalse(Schema::hasTable('requests'));
        $this->assertFalse(Schema::hasTable('request_items'));
        $this->assertFalse(Schema::hasTable('request_events'));
    }
}
