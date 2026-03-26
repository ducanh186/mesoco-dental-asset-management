<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locationTypes = ['Phòng khám', 'Kho', 'Phòng kỹ thuật', 'Phòng tiếp tân', 'Phòng xét nghiệm', 'Phòng chờ', 'Phòng mổ', 'Phòng X-quang'];
        $floors = ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng hầm'];

        return [
            'name' => fake()->randomElement($locationTypes) . ' ' . fake()->randomElement($floors) . ' - ' . fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->optional()->sentence(),
            'address' => fake()->optional()->address(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the location is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
