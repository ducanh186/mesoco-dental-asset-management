<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    protected $model = PurchaseOrderItem::class;

    public function definition(): array
    {
        $qty = fake()->randomFloat(2, 1, 10);
        $unitPrice = fake()->randomFloat(2, 100000, 2000000);

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'item_name' => fake()->words(3, true),
            'qty' => $qty,
            'unit' => fake()->randomElement(['cái', 'bộ', 'hộp']),
            'unit_price' => $unitPrice,
            'line_total' => round($qty * $unitPrice, 2),
            'note' => fake()->sentence(),
        ];
    }
}
