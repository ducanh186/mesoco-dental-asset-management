<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_profile_endpoint_returns_employee_payload(): void
    {
        $employee = Employee::factory()->create([
            'employee_code' => 'EMP-101',
            'full_name' => 'Nguyen Van A',
            'email' => 'nva@example.com',
        ]);
        $user = User::factory()->employee()->create([
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'name' => $employee->full_name,
            'email' => $employee->email,
        ]);

        $response = $this->actingAs($user)->getJson('/api/profile');

        $response->assertOk()
            ->assertJsonPath('profile.profile_type', 'employee')
            ->assertJsonPath('profile.employee_code', 'EMP-101')
            ->assertJsonPath('profile.full_name', 'Nguyen Van A');
    }

    public function test_supplier_profile_endpoint_returns_supplier_payload_and_can_be_updated(): void
    {
        $supplier = Supplier::factory()->create([
            'code' => 'NCC-201',
            'name' => 'Cong ty Vat tu',
            'contact_person' => 'Tran Thi B',
        ]);
        $user = User::factory()->supplier($supplier)->create();

        $response = $this->actingAs($user)->getJson('/api/profile');

        $response->assertOk()
            ->assertJsonPath('profile.profile_type', 'supplier')
            ->assertJsonPath('profile.supplier_code', 'NCC-201')
            ->assertJsonPath('profile.name', 'Cong ty Vat tu');

        $updateResponse = $this->actingAs($user)->putJson('/api/profile', [
            'name' => 'Cong ty Vat tu Moi',
            'contact_person' => 'Le Van C',
            'phone' => '0909009999',
            'address' => '123 Duong Moi',
            'note' => 'Cap nhat thong tin',
        ]);

        $updateResponse->assertOk()
            ->assertJsonPath('profile.profile_type', 'supplier')
            ->assertJsonPath('profile.name', 'Cong ty Vat tu Moi')
            ->assertJsonPath('profile.contact_person', 'Le Van C');

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Cong ty Vat tu Moi',
            'contact_person' => 'Le Van C',
            'phone' => '0909009999',
        ]);
    }
}
