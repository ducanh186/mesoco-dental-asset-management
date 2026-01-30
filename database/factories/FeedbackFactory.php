<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Feedback>
 */
class FeedbackFactory extends Factory
{
    protected $model = Feedback::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content' => fake()->paragraph(3),
            'type' => fake()->randomElement(Feedback::TYPES),
            'status' => fake()->randomElement(Feedback::STATUSES),
            'rating' => fake()->optional(0.5)->numberBetween(1, 5),
        ];
    }

    /**
     * New feedback status
     */
    public function statusNew(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Feedback::STATUS_NEW,
        ]);
    }

    /**
     * In progress status
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Feedback::STATUS_IN_PROGRESS,
        ]);
    }

    /**
     * Resolved status
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Feedback::STATUS_RESOLVED,
            'resolved_at' => now(),
            'resolved_by' => User::factory(),
        ]);
    }

    /**
     * Issue type
     */
    public function issue(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Feedback::TYPE_ISSUE,
        ]);
    }

    /**
     * Suggestion type
     */
    public function suggestion(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Feedback::TYPE_SUGGESTION,
        ]);
    }

    /**
     * Praise type
     */
    public function praise(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => Feedback::TYPE_PRAISE,
        ]);
    }
}
