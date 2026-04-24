<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_contract_endpoints_return_gone(): void
    {
        $manager = User::factory()->manager()->create(['must_change_password' => false]);
        $employee = Employee::factory()->create();

        $this->actingAs($manager)
            ->getJson("/api/employees/{$employee->id}/contracts")
            ->assertStatus(410);

        $this->actingAs($manager)
            ->getJson('/api/contracts/1')
            ->assertStatus(410);
    }

    public function test_removed_qr_and_personal_asset_endpoints_return_gone(): void
    {
        $employee = User::factory()->employee()->create(['must_change_password' => false]);

        $this->actingAs($employee)
            ->postJson('/api/qr/resolve', ['payload' => 'legacy'])
            ->assertStatus(410);

        $this->actingAs($employee)
            ->getJson('/api/my-assets')
            ->assertStatus(410);

        $this->actingAs($employee)
            ->getJson('/api/my-asset-history')
            ->assertStatus(410);
    }
}
