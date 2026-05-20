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
                    'item_name' => 'Bộ chuột bàn phím',
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

    public function test_manager_can_create_purchase_order_without_price_or_payment_fields(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create(['email' => 'supplier@example.com']);

        $response = $this->actingAs($manager)->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => '2026-05-14',
            'status' => PurchaseOrder::STATUS_PREPARING,
            'items' => [
                [
                    'item_name' => 'PC văn phòng',
                    'qty' => 3,
                    'unit' => 'cái',
                    'note' => 'Nhập giá sau khi kiểm hàng đạt',
                ],
            ],
            'note' => 'Đơn hàng chưa chốt giá ở bước tạo',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.payment_method', null)
            ->assertJsonPath('data.total_amount', null)
            ->assertJsonPath('data.items.0.unit_price', null)
            ->assertJsonPath('data.items.0.line_total', null)
            ->assertJsonPath('supplier_notification.status', 'sent');

        $this->assertDatabaseHas('purchase_order_items', [
            'item_name' => 'PC văn phòng',
            'unit_price' => null,
            'line_total' => null,
        ]);
    }

    public function test_manager_can_create_purchase_order_with_minimal_frontend_payload(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($manager)->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'items' => [
                [
                    'item_name' => 'PC văn phòng',
                    'qty' => 2,
                    'unit' => 'cái',
                    'note' => 'Nhập giá sau khi nhận hàng',
                ],
            ],
            'note' => 'Đơn hàng tạo từ UI',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.order_date', now()->toDateString())
            ->assertJsonPath('data.status', PurchaseOrder::STATUS_PREPARING)
            ->assertJsonPath('data.total_amount', null)
            ->assertJsonPath('data.items.0.unit_price', null)
            ->assertJsonPath('data.items.0.note', 'Nhập giá sau khi nhận hàng');
    }

    public function test_manager_must_provide_device_unit_when_creating_order_items(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($manager)->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => '2026-05-14',
            'items' => [
                [
                    'item_name' => 'PC văn phòng',
                    'qty' => 3,
                ],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.unit']);
    }

    public function test_manager_must_provide_device_unit_when_updating_order_items(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_PREPARING,
        ]);

        $response = $this->actingAs($manager)->putJson("/api/purchase-orders/{$order->id}", [
            'supplier_id' => $supplier->id,
            'order_date' => '2026-05-14',
            'status' => PurchaseOrder::STATUS_PREPARING,
            'items' => [
                [
                    'item_name' => 'PC văn phòng',
                    'qty' => 3,
                ],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.unit']);
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
            ->assertJsonPath('data.0.supplier.id', $supplierA->id)
            ->assertJsonPath('status_options', [
                PurchaseOrder::STATUS_PREPARING,
                PurchaseOrder::STATUS_DELIVERED,
            ]);
    }

    public function test_shipping_status_is_displayed_as_pending_delivery(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();

        PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_SHIPPING,
        ]);

        $response = $this->actingAs($manager)->getJson('/api/purchase-orders?status=preparing');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('summary.pending_delivery', 1)
            ->assertJsonPath('data.0.status', PurchaseOrder::STATUS_SHIPPING)
            ->assertJsonPath('data.0.status_label', 'Chờ giao hàng');
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
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', PurchaseOrder::STATUS_DELIVERED)
            ->assertJsonPath('data.status_label', 'Giao hàng thành công');

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);
    }

    public function test_manager_can_create_goods_receipt_for_delivered_purchase_order(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);
        $firstItem = PurchaseOrderItem::factory()->create([
            'purchase_order_id' => $order->id,
            'item_name' => 'Laptop văn phòng',
            'qty' => 2,
            'unit' => 'cái',
        ]);
        $secondItem = PurchaseOrderItem::factory()->create([
            'purchase_order_id' => $order->id,
            'item_name' => 'Màn hình 27 inch',
            'qty' => 1,
            'unit' => 'cái',
        ]);

        $response = $this->actingAs($manager)
            ->postJson("/api/purchase-orders/{$order->id}/receipt", [
                'received_at' => '2026-05-21 09:30:00',
                'note' => 'Hàng đạt chuẩn, nhập kho.',
                'items' => [
                    [
                        'purchase_order_item_id' => $firstItem->id,
                        'accepted_qty' => 2,
                        'rejected_qty' => 0,
                        'condition_status' => 'accepted',
                        'note' => 'Đạt chuẩn',
                    ],
                    [
                        'purchase_order_item_id' => $secondItem->id,
                        'accepted_qty' => 1,
                        'rejected_qty' => 0,
                        'condition_status' => 'accepted',
                        'note' => 'Đạt chuẩn',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.receipt.purchase_order_id', $order->id)
            ->assertJsonPath('data.receipt.status', 'completed')
            ->assertJsonPath('data.receipt.items.0.item_name', 'Laptop văn phòng')
            ->assertJsonPath('data.receipt.items.0.accepted_qty', '2.00')
            ->assertJsonPath('data.receipt.items.1.item_name', 'Màn hình 27 inch');

        $this->assertDatabaseHas('purchase_receipts', [
            'purchase_order_id' => $order->id,
            'received_by_user_id' => $manager->id,
            'status' => 'completed',
            'note' => 'Hàng đạt chuẩn, nhập kho.',
        ]);

        $this->assertDatabaseHas('purchase_receipt_items', [
            'purchase_order_item_id' => $firstItem->id,
            'item_name' => 'Laptop văn phòng',
            'accepted_qty' => 2,
            'condition_status' => 'accepted',
        ]);
    }

    public function test_cannot_create_goods_receipt_before_purchase_order_is_delivered(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_PREPARING,
        ]);
        PurchaseOrderItem::factory()->create(['purchase_order_id' => $order->id]);

        $this->actingAs($manager)
            ->postJson("/api/purchase-orders/{$order->id}/receipt", [
                'items' => [],
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Chỉ đơn hàng giao thành công mới được lập phiếu nhập hàng.');
    }

    public function test_goods_receipt_rejects_items_from_another_purchase_order(): void
    {
        $manager = User::factory()->manager()->create();
        $supplier = Supplier::factory()->create();
        $order = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);
        PurchaseOrderItem::factory()->create(['purchase_order_id' => $order->id]);

        $otherOrder = PurchaseOrder::factory()->create([
            'supplier_id' => $supplier->id,
            'status' => PurchaseOrder::STATUS_DELIVERED,
        ]);
        $otherItem = PurchaseOrderItem::factory()->create(['purchase_order_id' => $otherOrder->id]);

        $this->actingAs($manager)
            ->postJson("/api/purchase-orders/{$order->id}/receipt", [
                'items' => [
                    [
                        'purchase_order_item_id' => $otherItem->id,
                        'accepted_qty' => 1,
                    ],
                ],
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Dòng thiết bị nhập hàng không thuộc đơn hàng này.');
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
                'status' => PurchaseOrder::STATUS_DELIVERED,
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

    public function test_technician_cannot_access_purchase_order_module(): void
    {
        $technician = User::factory()->technician()->create();

        $this->actingAs($technician)
            ->getJson('/api/purchase-orders')
            ->assertForbidden();
    }
}
