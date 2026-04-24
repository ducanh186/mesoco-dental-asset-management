<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Employee::class;

    /**
     * Employee code counter for unique generation.
     */
    protected static int $employeeCodeCounter = 1000;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_code' => 'EMP' . str_pad((string) static::$employeeCodeCounter++, 4, '0', STR_PAD_LEFT),
            'full_name' => fake()->name(),
            'position' => fake()->randomElement([
                'IT Support Technician',
                'Software Engineer',
                'Finance Analyst',
                'Sales Executive',
                'Operations Staff',
                'Office Administrator',
            ]),
            'dob' => fake()->date('Y-m-d', '-25 years'),
            'gender' => fake()->randomElement(['male', 'female']),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->address(),
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the employee is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the employee is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
