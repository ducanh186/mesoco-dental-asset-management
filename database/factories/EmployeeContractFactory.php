<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\EmployeeContract;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeContract>
 */
class EmployeeContractFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = EmployeeContract::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 years', 'now');
        $endDate = fake()->optional(0.7)->dateTimeBetween($startDate, '+3 years');

        return [
            'employee_id' => Employee::factory(),
            'department' => fake()->randomElement(['Clinical', 'Administration', 'Technical', 'Reception', null]),
            'contract_type' => fake()->randomElement(EmployeeContract::TYPES),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(EmployeeContract::STATUSES),
            'pdf_path' => null,
            'created_by' => null,
        ];
    }

    /**
     * Set the contract as active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EmployeeContract::STATUS_ACTIVE,
            'end_date' => fake()->dateTimeBetween('+1 month', '+3 years'),
        ]);
    }

    /**
     * Set the contract as expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EmployeeContract::STATUS_EXPIRED,
            'end_date' => fake()->dateTimeBetween('-1 year', '-1 day'),
        ]);
    }

    /**
     * Set the contract as pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EmployeeContract::STATUS_PENDING,
            'start_date' => fake()->dateTimeBetween('+1 day', '+1 month'),
        ]);
    }

    /**
     * Set the contract type to full time.
     */
    public function fullTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_type' => EmployeeContract::TYPE_FULL_TIME,
        ]);
    }

    /**
     * Set the contract type to part time.
     */
    public function partTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_type' => EmployeeContract::TYPE_PART_TIME,
        ]);
    }

    /**
     * Set the contract type to intern.
     */
    public function intern(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_type' => EmployeeContract::TYPE_INTERN,
        ]);
    }

    /**
     * Associate with a specific employee.
     */
    public function forEmployee(Employee $employee): static
    {
        return $this->state(fn (array $attributes) => [
            'employee_id' => $employee->id,
        ]);
    }

    /**
     * Set the creator user.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }
}
