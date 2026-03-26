<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MaintenanceEvent>
 */
class MaintenanceEventFactory extends Factory
{
    protected $model = MaintenanceEvent::class;
    
    /**
     * Counter for unique code generation in tests.
     */
    protected static int $codeCounter = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate unique code for tests
        $code = 'MNT-' . now()->format('Ym') . '-' . str_pad((string) static::$codeCounter++, 4, '0', STR_PAD_LEFT);
        
        return [
            'code' => $code,
            'asset_id' => Asset::factory(),
            'type' => $this->faker->randomElement(MaintenanceEvent::TYPES),
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'planned_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'priority' => $this->faker->randomElement(MaintenanceEvent::PRIORITIES),
            'note' => $this->faker->optional()->sentence(),
            'estimated_duration_minutes' => $this->faker->optional()->numberBetween(15, 480),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the maintenance is scheduled.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'started_at' => null,
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the maintenance is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
            'started_at' => now(),
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the maintenance is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_COMPLETED,
            'started_at' => now()->subHours(2),
            'completed_at' => now(),
            'result_note' => $this->faker->sentence(),
            'actual_duration_minutes' => $this->faker->numberBetween(30, 240),
            'cost' => $this->faker->optional()->randomFloat(2, 50, 500),
        ]);
    }

    /**
     * Indicate that the maintenance is canceled.
     */
    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_CANCELED,
            'completed_at' => null,
        ]);
    }

    /**
     * Set the maintenance type.
     */
    public function type(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
        ]);
    }

    /**
     * Set the priority.
     */
    public function priority(string $priority): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => $priority,
        ]);
    }

    /**
     * Make the maintenance overdue (planned in the past, still scheduled).
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'planned_at' => $this->faker->dateTimeBetween('-7 days', '-1 day'),
        ]);
    }

    /**
     * Make the maintenance upcoming (planned within next few days).
     */
    public function upcoming(int $days = 7): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MaintenanceEvent::STATUS_SCHEDULED,
            'planned_at' => $this->faker->dateTimeBetween('now', "+{$days} days"),
        ]);
    }
}
