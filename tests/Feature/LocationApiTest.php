<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Helper to create a user with a given role.
     */
    private function createUserWithRole(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'must_change_password' => false,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | RBAC Tests
    |--------------------------------------------------------------------------
    */

    public function test_unauthenticated_user_cannot_access_locations(): void
    {
        $response = $this->getJson('/api/locations');
        $response->assertStatus(401);
    }

    public function test_staff_cannot_access_locations(): void
    {
        $user = $this->createUserWithRole('staff');

        $response = $this->actingAs($user)->getJson('/api/locations');
        $response->assertStatus(403);
    }

    public function test_employee_cannot_access_locations(): void
    {
        $user = $this->createUserWithRole('employee');

        $response = $this->actingAs($user)->getJson('/api/locations');
        $response->assertStatus(403);
    }

    public function test_technician_can_access_locations(): void
    {
        $user = $this->createUserWithRole('technician');
        Location::factory()->count(2)->create();

        $response = $this->actingAs($user)->getJson('/api/locations');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_hr_can_access_locations(): void
    {
        $user = $this->createUserWithRole('hr');
        Location::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/locations');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'per_page',
                'total',
            ]);
    }

    public function test_admin_can_access_locations(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/locations');
        $response->assertStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | CRUD Tests
    |--------------------------------------------------------------------------
    */

    public function test_can_list_locations_with_pagination(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->count(30)->create();

        $response = $this->actingAs($user)->getJson('/api/locations?per_page=10');
        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('per_page', 10)
            ->assertJsonPath('total', 30);
    }

    public function test_can_filter_active_locations(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->count(3)->create(['is_active' => true]);
        Location::factory()->count(2)->inactive()->create();

        $response = $this->actingAs($user)->getJson('/api/locations?active_only=1');
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_search_locations_by_name(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'Phòng khám A']);
        Location::factory()->create(['name' => 'Kho thiết bị']);
        Location::factory()->create(['name' => 'Phòng khám B']);

        $response = $this->actingAs($user)->getJson('/api/locations?search=Phòng khám');
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_create_location(): void
    {
        $user = $this->createUserWithRole('admin');

        $data = [
            'name' => 'Phòng khám mới',
            'description' => 'Mô tả phòng khám',
            'address' => '123 Đường ABC',
            'is_active' => true,
        ];

        $response = $this->actingAs($user)->postJson('/api/locations', $data);
        $response->assertStatus(201)
            ->assertJsonPath('message', 'Location created successfully.')
            ->assertJsonPath('data.name', 'Phòng khám mới');

        $this->assertDatabaseHas('locations', ['name' => 'Phòng khám mới']);
    }

    public function test_cannot_create_location_with_duplicate_name(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'Existing Location']);

        $data = [
            'name' => 'Existing Location',
        ];

        $response = $this->actingAs($user)->postJson('/api/locations', $data);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_can_view_single_location(): void
    {
        $user = $this->createUserWithRole('admin');
        $location = Location::factory()->create(['name' => 'Test Location']);

        $response = $this->actingAs($user)->getJson("/api/locations/{$location->id}");
        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Test Location')
            ->assertJsonStructure([
                'data' => ['id', 'name', 'description', 'address', 'is_active', 'assets_count'],
            ]);
    }

    public function test_can_update_location(): void
    {
        $user = $this->createUserWithRole('admin');
        $location = Location::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user)->putJson("/api/locations/{$location->id}", [
            'name' => 'New Name',
            'description' => 'Updated description',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Location updated successfully.')
            ->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('locations', ['id' => $location->id, 'name' => 'New Name']);
    }

    public function test_cannot_update_location_with_duplicate_name(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'Location A']);
        $locationB = Location::factory()->create(['name' => 'Location B']);

        $response = $this->actingAs($user)->putJson("/api/locations/{$locationB->id}", [
            'name' => 'Location A',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_can_delete_location_without_assets(): void
    {
        $user = $this->createUserWithRole('admin');
        $location = Location::factory()->create(['name' => 'Empty Location']);

        $response = $this->actingAs($user)->deleteJson("/api/locations/{$location->id}");
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Location deleted successfully.');

        $this->assertDatabaseMissing('locations', ['id' => $location->id]);
    }

    public function test_delete_location_with_assets_deactivates_instead(): void
    {
        $user = $this->createUserWithRole('admin');
        $location = Location::factory()->create(['name' => 'Busy Location', 'is_active' => true]);

        // Create an asset at this location
        \App\Models\Asset::factory()->create(['location' => 'Busy Location']);

        $response = $this->actingAs($user)->deleteJson("/api/locations/{$location->id}");
        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Location deactivated. 1 asset(s) are still assigned to this location.']);

        // Should still exist but be inactive
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'is_active' => false,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Dropdown Endpoint Tests
    |--------------------------------------------------------------------------
    */

    public function test_dropdown_returns_only_active_locations(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->count(3)->create(['is_active' => true]);
        Location::factory()->count(2)->inactive()->create();

        $response = $this->actingAs($user)->getJson('/api/locations/dropdown');
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name'],
                ],
            ]);
    }

    public function test_dropdown_returns_locations_sorted_by_name(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'Zebra Location']);
        Location::factory()->create(['name' => 'Alpha Location']);
        Location::factory()->create(['name' => 'Beta Location']);

        $response = $this->actingAs($user)->getJson('/api/locations/dropdown');
        $response->assertStatus(200);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertEquals(['Alpha Location', 'Beta Location', 'Zebra Location'], $names);
    }

    /*
    |--------------------------------------------------------------------------
    | Sorting Tests
    |--------------------------------------------------------------------------
    */

    public function test_can_sort_locations_by_name(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'C Location']);
        Location::factory()->create(['name' => 'A Location']);
        Location::factory()->create(['name' => 'B Location']);

        $response = $this->actingAs($user)->getJson('/api/locations?sort_by=name&sort_dir=asc');
        $response->assertStatus(200);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertEquals(['A Location', 'B Location', 'C Location'], $names);
    }

    public function test_can_sort_locations_descending(): void
    {
        $user = $this->createUserWithRole('admin');
        Location::factory()->create(['name' => 'C Location']);
        Location::factory()->create(['name' => 'A Location']);
        Location::factory()->create(['name' => 'B Location']);

        $response = $this->actingAs($user)->getJson('/api/locations?sort_by=name&sort_dir=desc');
        $response->assertStatus(200);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertEquals(['C Location', 'B Location', 'A Location'], $names);
    }
}
