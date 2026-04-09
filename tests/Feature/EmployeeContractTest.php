<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeContractTest extends TestCase
{
    use RefreshDatabase;

    private const LEGACY_MESSAGE = 'Employee contract module has been removed from the main product scope.';

    private function createUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'must_change_password' => false,
        ]);
    }

    public function test_unauthenticated_user_gets_401_on_legacy_contract_routes(): void
    {
        $employee = Employee::factory()->create();

        $this->getJson("/api/employees/{$employee->id}/contracts")
            ->assertStatus(401);
    }

    public function test_manager_gets_gone_for_legacy_contract_listing_route(): void
    {
        $manager = $this->createUser('manager');
        $employee = Employee::factory()->create();

        $this->actingAs($manager)
            ->getJson("/api/employees/{$employee->id}/contracts")
            ->assertStatus(410)
            ->assertJsonPath('message', self::LEGACY_MESSAGE);
    }

    public function test_technician_gets_gone_for_legacy_contract_creation_route(): void
    {
        $technician = $this->createUser('technician');
        $employee = Employee::factory()->create();

        $this->actingAs($technician)
            ->postJson("/api/employees/{$employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
            ])
            ->assertStatus(410)
            ->assertJsonPath('message', self::LEGACY_MESSAGE);
    }

    public function test_employee_gets_gone_for_legacy_contract_detail_route(): void
    {
        $employeeUser = $this->createUser('employee');

        $this->actingAs($employeeUser)
            ->getJson('/api/contracts/1')
            ->assertStatus(410)
            ->assertJsonPath('message', self::LEGACY_MESSAGE);
    }

    public function test_legacy_contract_file_route_is_gone_for_authenticated_users(): void
    {
        $manager = $this->createUser('manager');

        $this->actingAs($manager)
            ->getJson('/api/contracts/1/file')
            ->assertStatus(410)
            ->assertJsonPath('message', self::LEGACY_MESSAGE);
    }
}
