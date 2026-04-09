<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'must_change_password' => false,
        ]);
    }

    public function test_employee_cannot_access_supplier_catalog(): void
    {
        $user = $this->createUser('employee');

        $this->actingAs($user)
            ->getJson('/api/suppliers')
            ->assertForbidden();
    }

    public function test_technician_can_list_suppliers(): void
    {
        $user = $this->createUser('technician');
        Supplier::factory()->count(3)->create();

        $this->actingAs($user)
            ->getJson('/api/suppliers')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_manager_can_create_supplier(): void
    {
        $user = $this->createUser('manager');

        $response = $this->actingAs($user)->postJson('/api/suppliers', [
            'code' => 'NCC-001',
            'name' => 'Cong ty ABC',
            'contact_person' => 'Nguyen Van A',
            'phone' => '0909000000',
            'email' => 'abc@example.com',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.code', 'NCC-001')
            ->assertJsonPath('data.name', 'Cong ty ABC');

        $this->assertDatabaseHas('suppliers', [
            'code' => 'NCC-001',
            'name' => 'Cong ty ABC',
        ]);
    }

    public function test_can_update_supplier(): void
    {
        $user = $this->createUser('manager');
        $supplier = Supplier::factory()->create([
            'name' => 'Old Supplier',
        ]);

        $response = $this->actingAs($user)->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'New Supplier',
            'contact_person' => 'Tran Thi B',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'New Supplier');

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'New Supplier',
        ]);
    }

    public function test_cannot_delete_supplier_when_assets_are_linked(): void
    {
        $user = $this->createUser('manager');
        $supplier = Supplier::factory()->create();
        Asset::factory()->create([
            'supplier_id' => $supplier->id,
        ]);

        $this->actingAs($user)
            ->deleteJson("/api/suppliers/{$supplier->id}")
            ->assertStatus(422)
            ->assertJsonPath('data.assets_count', 1);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
        ]);
    }

    public function test_dropdown_returns_basic_supplier_options(): void
    {
        $user = $this->createUser('technician');
        Supplier::factory()->create([
            'code' => 'NCC-010',
            'name' => 'Supplier A',
        ]);

        $this->actingAs($user)
            ->getJson('/api/suppliers/dropdown')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'name'],
                ],
            ]);
    }
}
