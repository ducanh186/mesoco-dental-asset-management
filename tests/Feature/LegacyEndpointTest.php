<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_contract_endpoints_return_removed_scope_response(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();

        $this->actingAs($manager)
            ->getJson("/api/employees/{$employee->id}/contracts")
            ->assertStatus(410)
            ->assertJsonPath('message', 'Employee contract module has been removed from the main product scope.');

        $this->actingAs($manager)
            ->getJson('/api/contracts/1')
            ->assertStatus(410)
            ->assertJsonPath('message', 'Employee contract module has been removed from the main product scope.');
    }

    public function test_qr_resolve_rejects_invalid_payload_while_personal_asset_endpoints_remain_removed(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($employee)
            ->postJson('/api/qr/resolve', ['payload' => 'legacy'])
            ->assertStatus(422)
            ->assertJsonPath('error', 'INVALID_QR_FORMAT');

        $this->actingAs($employee)
            ->getJson('/api/my-assets')
            ->assertStatus(410);

        $this->actingAs($employee)
            ->getJson('/api/my-asset-history')
            ->assertStatus(410);
    }
}
