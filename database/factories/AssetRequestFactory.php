<?php

namespace Database\Factories;

use App\Models\AssetRequest;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetRequest>
 */
class AssetRequestFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = AssetRequest::class;

    /**
     * Request code counter for unique generation.
     */
    protected static int $codeCounter = 1;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $employee = Employee::factory()->create();

        return [
            'code' => sprintf('REQ-%s-%04d', now()->format('Ym'), static::$codeCounter++),
            'type' => fake()->randomElement(AssetRequest::REQUESTABLE_TYPES),
            'status' => AssetRequest::STATUS_SUBMITTED,
            'requested_by_employee_id' => $employee->id,
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'severity' => fake()->randomElement(AssetRequest::SEVERITIES),
        ];
    }

    /**
     * Request is a justification.
     */
    public function justification(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AssetRequest::TYPE_JUSTIFICATION,
            'incident_at' => now()->subDays(fake()->numberBetween(1, 7)),
            'suspected_cause' => fake()->randomElement(AssetRequest::SUSPECTED_CAUSES),
        ]);
    }

    /**
     * Legacy helper retained for compatibility with older tests.
     */
    public function assetLoan(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AssetRequest::TYPE_ASSET_LOAN,
        ]);
    }

    /**
     * Request is a consumable request.
     */
    public function consumableRequest(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
        ]);
    }

    /**
     * Request has been submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssetRequest::STATUS_SUBMITTED,
        ]);
    }

    /**
     * Request has been approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssetRequest::STATUS_APPROVED,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Request has been rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssetRequest::STATUS_REJECTED,
            'reviewed_at' => now(),
            'review_note' => fake()->sentence(),
        ]);
    }

    /**
     * Request has been cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AssetRequest::STATUS_CANCELLED,
        ]);
    }
}
