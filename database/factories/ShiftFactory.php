<?php

namespace Database\Factories;

use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shift>
 */
class ShiftFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Shift::class;

    /**
     * Shift counter for unique codes.
     */
    protected static int $shiftCounter = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $shifts = [
            ['code' => 'MORNING', 'name' => 'Morning Shift', 'start_time' => '07:00:00', 'end_time' => '12:00:00'],
            ['code' => 'AFTERNOON', 'name' => 'Afternoon Shift', 'start_time' => '12:00:00', 'end_time' => '17:00:00'],
            ['code' => 'EVENING', 'name' => 'Evening Shift', 'start_time' => '17:00:00', 'end_time' => '22:00:00'],
        ];

        $shift = $shifts[array_rand($shifts)];

        return [
            'code' => $shift['code'] . '_' . static::$shiftCounter++,
            'name' => $shift['name'],
            'start_time' => $shift['start_time'],
            'end_time' => $shift['end_time'],
            'is_active' => true,
            'sort_order' => static::$shiftCounter,
        ];
    }

    /**
     * Indicate that the shift is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Morning shift.
     */
    public function morning(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'MORNING',
            'name' => 'Morning Shift',
            'start_time' => '07:00:00',
            'end_time' => '12:00:00',
        ]);
    }

    /**
     * Afternoon shift.
     */
    public function afternoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'AFTERNOON',
            'name' => 'Afternoon Shift',
            'start_time' => '12:00:00',
            'end_time' => '17:00:00',
        ]);
    }

    /**
     * Evening shift.
     */
    public function evening(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'EVENING',
            'name' => 'Evening Shift',
            'start_time' => '17:00:00',
            'end_time' => '22:00:00',
        ]);
    }
}
