<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetAssignment>
 */
class AssetAssignmentFactory extends Factory
{
    protected $model = AssetAssignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_id' => Asset::factory(),
            'employee_id' => Employee::factory(),
            'assigned_at' => now(),
            'assigned_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the assignment has ended.
     */
    public function returned(): static
    {
        return $this->state(fn (array $attributes) => [
            'returned_at' => now(),
        ]);
    }
}
