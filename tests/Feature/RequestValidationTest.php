<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\RequestItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequestValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $doctor;
    private User $admin;
    private Employee $doctorEmployee;
    private Asset $assignedAsset;
    private Asset $unassignedAsset;
    private Asset $assignedToOtherAsset;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user first (needed for assigned_by)
        $this->admin = User::factory()->create(['role' => 'admin']);

        // Create employee first, then user with employee_id link
        $this->doctorEmployee = Employee::factory()->create();
        $this->doctor = User::factory()->create([
            'role' => 'doctor',
            'employee_id' => $this->doctorEmployee->id,
        ]);

        // Create another employee for testing
        $otherEmployee = Employee::factory()->create();

        // Create assets
        $this->assignedAsset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $this->unassignedAsset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        $this->assignedToOtherAsset = Asset::factory()->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        // Assign assets (assigned_by is required FK)
        AssetAssignment::create([
            'asset_id' => $this->assignedAsset->id,
            'employee_id' => $this->doctorEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
        ]);

        AssetAssignment::create([
            'asset_id' => $this->assignedToOtherAsset->id,
            'employee_id' => $otherEmployee->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
        ]);
    }

    /** @test */
    public function justification_request_requires_asset_assigned_to_user()
    {
        // Valid request with owned asset
        $validResponse = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'title' => 'Equipment Issue',
                'description' => 'Tool is broken',
                'severity' => 'high',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $this->assignedAsset->id,
                        'note' => 'Broken during procedure',
                    ]
                ],
            ]);

        $validResponse->assertCreated();

        // Invalid request with unowned asset
        $invalidResponse = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'title' => 'Equipment Issue',
                'description' => 'Tool is broken',
                'severity' => 'high',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $this->assignedToOtherAsset->id,
                        'note' => 'Trying to report issue for unowned asset',
                    ]
                ],
            ]);

        $invalidResponse->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.asset_id']);

        // Vietnamese error message - use array access for dotted keys
        $errors = $invalidResponse->json('errors');
        $this->assertArrayHasKey('items.0.asset_id', $errors);
        $this->assertStringContainsString(
            'tài sản đã được giao cho mình',
            $errors['items.0.asset_id'][0]
        );
    }

    /** @test */
    public function justification_request_rejects_unassigned_asset()
    {
        $response = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'title' => 'Equipment Issue',
                'severity' => 'high',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $this->unassignedAsset->id,
                    ]
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.asset_id']);
    }

    /** @test */
    public function asset_loan_request_requires_available_asset()
    {
        // Valid request with available asset
        $validResponse = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'title' => 'Borrow Equipment',
                'description' => 'Need for procedure',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $this->unassignedAsset->id,
                        'from_date' => now()->addDay()->toDateString(),
                        'to_date' => now()->addDays(3)->toDateString(),
                    ]
                ],
            ]);

        $validResponse->assertCreated();

        // Invalid request with assigned asset
        $invalidResponse = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'title' => 'Borrow Equipment',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $this->assignedAsset->id,
                        'from_date' => now()->addDay()->toDateString(),
                        'to_date' => now()->addDays(3)->toDateString(),
                    ]
                ],
            ]);

        $invalidResponse->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.asset_id']);

        // Vietnamese error message - use array access for dotted keys
        $errors = $invalidResponse->json('errors');
        $this->assertArrayHasKey('items.0.asset_id', $errors);
        $this->assertStringContainsString(
            'đã được giao cho người khác',
            $errors['items.0.asset_id'][0]
        );
    }

    /** @test */
    public function asset_loan_request_rejects_inactive_asset()
    {
        $inactiveAsset = Asset::factory()->create([
            'status' => Asset::STATUS_MAINTENANCE,
        ]);

        $response = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'title' => 'Borrow Equipment',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => $inactiveAsset->id,
                        'from_date' => now()->addDay()->toDateString(),
                        'to_date' => now()->addDays(3)->toDateString(),
                    ]
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.asset_id']);

        // Vietnamese error message with status - use array access for dotted keys
        $errors = $response->json('errors');
        $this->assertArrayHasKey('items.0.asset_id', $errors);
        $this->assertStringContainsString(
            'không khả dụng để mượn',
            $errors['items.0.asset_id'][0]
        );
    }

    /** @test */
    public function request_validation_handles_nonexistent_asset()
    {
        $response = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'title' => 'Equipment Issue',
                'severity' => 'high',
                'items' => [
                    [
                        'item_kind' => RequestItem::KIND_ASSET,
                        'asset_id' => 99999, // Non-existent ID
                    ]
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.asset_id']);

        // Laravel's built-in 'exists' validation returns English message
        $errors = $response->json('errors');
        $this->assertArrayHasKey('items.0.asset_id', $errors);
        $this->assertStringContainsString(
            'does not exist',
            $errors['items.0.asset_id'][0]
        );
    }

    /** @test */
    public function validation_handles_multiple_items_efficiently()
    {
        // Create multiple assets
        $assets = Asset::factory()->count(3)->create([
            'status' => Asset::STATUS_ACTIVE,
        ]);

        // Assign all to doctor
        foreach ($assets as $asset) {
            AssetAssignment::create([
                'asset_id' => $asset->id,
                'employee_id' => $this->doctorEmployee->id,
                'assigned_by' => $this->admin->id,
                'assigned_at' => now(),
            ]);
        }

        // Request with multiple items should work
        $response = $this->actingAs($this->doctor)
            ->postJson('/api/requests', [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'title' => 'Multiple Issues',
                'severity' => 'medium',
                'items' => collect($assets)->map(fn($asset) => [
                    'item_kind' => RequestItem::KIND_ASSET,
                    'asset_id' => $asset->id,
                    'note' => "Issue with {$asset->name}",
                ])->toArray(),
            ]);

        $response->assertCreated();
    }
}
