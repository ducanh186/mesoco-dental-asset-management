<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        return [
            'order_code' => PurchaseOrder::generateCode(),
            'supplier_id' => Supplier::factory(),
            'requested_by_user_id' => User::factory()->manager(),
            'approved_by_user_id' => User::factory()->manager(),
            'order_date' => fake()->dateTimeBetween('-10 days', 'now')->format('Y-m-d'),
            'expected_delivery_date' => fake()->dateTimeBetween('now', '+10 days')->format('Y-m-d'),
            'status' => fake()->randomElement(PurchaseOrder::statusOptions()),
            'total_amount' => fake()->randomFloat(2, 1000000, 10000000),
            'payment_method' => fake()->randomElement(['Chuyển khoản', 'Tiền mặt', 'Công nợ']),
            'note' => fake()->sentence(),
        ];
    }
}
