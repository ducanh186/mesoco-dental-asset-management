<?php

namespace Tests\Feature;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_purchase_order_with_items_and_payment_method(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($manager)->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => '2026-04-09',
            'expected_delivery_date' => '2026-04-12',
            'status' => 'preparing',
            'payment_method' => 'Chuyển khoản',
            'items' => [
                [
                    'item_name' => 'Tay khoan tốc độ cao',
                    'qty' => 2,
                    'unit' => 'cái',
                    'unit_price' => 1500000,
                ],
                [
                    'item_name' => 'Bộ gương nha khoa',
                    'qty' => 1,
                    'unit' => 'bộ',
                    'unit_price' => 450000,
                ],
            ],
            'note' => 'Đơn hàng tháng 4',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.supplier.id', $supplier->id)
            ->assertJsonPath('data.status', 'preparing')
            ->assertJsonPath('data.payment_method', 'Chuyển khoản')
            ->assertJsonPath('data.total_amount', '3450000.00')
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $supplier->id,
            'status' => 'preparing',
            'payment_method' => 'Chuyển khoản',
        ]);

        $this->assertDatabaseCount('purchase_order_items', 2);
    }

    public function test_supplier_only_sees_own_purchase_orders(): void
    {
        $supplierA = Supplier::factory()->create(['name' => 'NCC A']);
        $supplierB = Supplier::factory()->create(['name' => 'NCC B']);
        $supplierUser = User::factory()->supplier($supplierA)->create();
        User::factory()->supplier($supplierB)->create();

        PurchaseOrder::factory()->create([
            'supplier_id' => $supplierA->id,
            'status' => PurchaseOrder::STATUS_PREPARING,
        ]);
        PurchaseOrder::factory()->create([
            'supplier_id' => $supplierB->id,
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);

        $response = $this->actingAs($supplierUser)->getJson('/api/purchase-orders');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('summary.total', 1)
            ->assertJsonPath('data.0.supplier.id', $supplierA->id);
    }

    public function test_supplier_can_update_status_for_own_order(): void
    {
        $supplier = Supplier::factory()->create();
        $supplierUser = User::factory()->supplier($supplier)->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_PREPARING,
        ]);
        PurchaseOrderItem::factory()->count(2)->create([
            'purchase_order_id' => $order->id,
        ]);

        $response = $this->actingAs($supplierUser)->patchJson("/api/purchase-orders/{$order->id}/status", [
            'status' => PurchaseOrder::STATUS_SHIPPING,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', PurchaseOrder::STATUS_SHIPPING);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => PurchaseOrder::STATUS_SHIPPING,
        ]);
    }

    public function test_supplier_cannot_update_other_supplier_order(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();
        $supplierUser = User::factory()->supplier($supplierA)->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplierB->id,
            'status' => PurchaseOrder::STATUS_PREPARING,
        ]);

        $this->actingAs($supplierUser)
            ->patchJson("/api/purchase-orders/{$order->id}/status", [
                'status' => PurchaseOrder::STATUS_SHIPPING,
            ])
            ->assertNotFound();
    }

    public function test_employee_cannot_access_purchase_order_module(): void
    {
        $employee = User::factory()->employee()->create();

        $this->actingAs($employee)
            ->getJson('/api/purchase-orders')
            ->assertForbidden();
    }
}
