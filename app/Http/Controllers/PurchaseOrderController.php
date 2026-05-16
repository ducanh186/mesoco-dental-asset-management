<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderStatusRequest;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $this->visibleOrdersQuery($user);

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('order_code', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                        $supplierQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($itemQuery) use ($search) {
                        $itemQuery->where('item_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->query('status')) {
            $query->whereIn('status', PurchaseOrder::statusesForFilter($status));
        }

        $perPage = (int) $request->query('per_page', 15);
        $orders = $query
            ->orderByDesc('order_date')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $summaryQuery = $this->visibleOrdersQuery($user);

        if ($status = $request->query('status')) {
            $summaryQuery->whereIn('status', PurchaseOrder::statusesForFilter($status));
        }

        $pendingDeliveryCount = (clone $summaryQuery)
            ->whereIn('status', [PurchaseOrder::STATUS_PREPARING, PurchaseOrder::STATUS_SHIPPING])
            ->count();

        return response()->json([
            'data' => collect($orders->items())->map(fn (PurchaseOrder $order) => $this->serializeOrder($order))->all(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'per_page' => $orders->perPage(),
            'total' => $orders->total(),
            'summary' => [
                'total' => (clone $summaryQuery)->count(),
                'pending_delivery' => $pendingDeliveryCount,
                'preparing' => $pendingDeliveryCount,
                'shipping' => (clone $summaryQuery)->where('status', PurchaseOrder::STATUS_SHIPPING)->count(),
                'delivered' => (clone $summaryQuery)->where('status', PurchaseOrder::STATUS_DELIVERED)->count(),
            ],
            'status_options' => PurchaseOrder::statusOptions(),
        ]);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $order = $this->findAccessibleOrder($request->user(), $purchaseOrder->id);

        return response()->json([
            'data' => $this->serializeOrder($order),
            'status_options' => PurchaseOrder::statusOptions(),
        ]);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request) {
            $validated = $request->validated();

            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'requested_by_user_id' => $request->user()->id,
                'approved_by_user_id' => $request->user()->isManager() ? $request->user()->id : null,
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'status' => $validated['status'],
                'payment_method' => $validated['payment_method'] ?? null,
                'note' => $validated['note'] ?? null,
            ]);

            $this->syncItems($purchaseOrder, $validated['items']);

            return $purchaseOrder->fresh([
                'supplier:id,code,name,contact_person,email',
                'requester:id,name,employee_code',
                'approver:id,name,employee_code',
                'items',
            ]);
        });

        $supplierNotification = $this->notifySupplier($order);

        return response()->json([
            'message' => 'Tạo đơn hàng thành công.',
            'data' => $this->serializeOrder($order),
            'supplier_notification' => $supplierNotification,
        ], 201);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $order = $this->findAccessibleOrder($request->user(), $purchaseOrder->id);

        if (!$request->user()->isManager()) {
            abort(403);
        }

        $order = DB::transaction(function () use ($request, $order) {
            $validated = $request->validated();

            $order->update([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'status' => $validated['status'],
                'payment_method' => $validated['payment_method'] ?? null,
                'note' => $validated['note'] ?? null,
                'approved_by_user_id' => $request->user()->isManager() ? $request->user()->id : $order->approved_by_user_id,
            ]);

            $this->syncItems($order, $validated['items']);

            return $order->fresh([
                'supplier:id,code,name,contact_person,email',
                'requester:id,name,employee_code',
                'approver:id,name,employee_code',
                'items',
            ]);
        });

        return response()->json([
            'message' => 'Cập nhật đơn hàng thành công.',
            'data' => $this->serializeOrder($order),
        ]);
    }

    public function destroy(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->isManager()) {
            abort(403);
        }

        $order = $this->findAccessibleOrder($request->user(), $purchaseOrder->id);
        $order->delete();

        return response()->json([
            'message' => 'Xóa đơn hàng thành công.',
        ]);
    }

    public function updateStatus(UpdatePurchaseOrderStatusRequest $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->user();
        $order = $this->findAccessibleOrder($user, $purchaseOrder->id);

        $order->update([
            'status' => $request->validated()['status'],
            'approved_by_user_id' => $user->isSupplier() ? $order->approved_by_user_id : $user->id,
            'note' => $request->filled('note') ? $request->string('note')->toString() : $order->note,
        ]);

        $order->refresh()->loadMissing([
            'supplier:id,code,name,contact_person,email',
            'requester:id,name,employee_code',
            'approver:id,name,employee_code',
            'items',
        ]);

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công.',
            'data' => $this->serializeOrder($order),
        ]);
    }

    private function visibleOrdersQuery(User $user)
    {
        $query = PurchaseOrder::query()
            ->with([
                'supplier:id,code,name,contact_person,email',
                'requester:id,name,employee_code',
                'approver:id,name,employee_code',
                'items',
            ])
            ->withCount('items');

        if ($user->isManager()) {
            return $query;
        }

        if ($user->isSupplier()) {
            abort_if(!$user->supplier_id, 403, 'Tài khoản nhà cung cấp chưa được liên kết.');
            $query->where('supplier_id', $user->supplier_id);

            return $query;
        }

        abort(403);
    }

    private function findAccessibleOrder(User $user, int $orderId): PurchaseOrder
    {
        return $this->visibleOrdersQuery($user)->findOrFail($orderId);
    }

    private function syncItems(PurchaseOrder $purchaseOrder, array $items): void
    {
        $purchaseOrder->items()->delete();

        $totalAmount = 0;
        $hasPricedItems = false;

        foreach ($items as $item) {
            $qty = (float) $item['qty'];
            $unitPrice = array_key_exists('unit_price', $item) && $item['unit_price'] !== null && $item['unit_price'] !== ''
                ? (float) $item['unit_price']
                : null;
            $lineTotal = $unitPrice !== null ? round($qty * $unitPrice, 2) : null;

            if ($lineTotal !== null) {
                $totalAmount += $lineTotal;
                $hasPricedItems = true;
            }

            $purchaseOrder->items()->create([
                'asset_id' => $item['asset_id'] ?? null,
                'category_id' => $item['category_id'] ?? null,
                'item_name' => $item['item_name'],
                'qty' => $qty,
                'unit' => $item['unit'] ?? null,
                'unit_price' => $unitPrice,
                'line_total' => $lineTotal,
                'note' => $item['note'] ?? null,
            ]);
        }

        $purchaseOrder->forceFill([
            'total_amount' => $hasPricedItems ? round($totalAmount, 2) : null,
        ])->save();
    }

    private function serializeOrder(PurchaseOrder $order): array
    {
        $order->loadMissing([
            'supplier:id,code,name,contact_person,email',
            'requester:id,name,employee_code',
            'approver:id,name,employee_code',
            'items',
        ]);

        return [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'order_date' => optional($order->order_date)->format('Y-m-d'),
            'expected_delivery_date' => optional($order->expected_delivery_date)->format('Y-m-d'),
            'status' => $order->status,
            'status_label' => PurchaseOrder::displayStatus($order->status),
            'payment_method' => $order->payment_method,
            'total_amount' => $order->total_amount,
            'note' => $order->note,
            'items_count' => $order->items_count ?? $order->items->count(),
            'supplier' => $order->supplier ? [
                'id' => $order->supplier->id,
                'code' => $order->supplier->code,
                'name' => $order->supplier->name,
                'contact_person' => $order->supplier->contact_person,
                'email' => $order->supplier->email,
            ] : null,
            'requester' => $order->requester ? [
                'id' => $order->requester->id,
                'name' => $order->requester->name,
                'employee_code' => $order->requester->employee_code,
            ] : null,
            'approver' => $order->approver ? [
                'id' => $order->approver->id,
                'name' => $order->approver->name,
                'employee_code' => $order->approver->employee_code,
            ] : null,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'qty' => $item->qty,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'note' => $item->note,
                    'asset_id' => $item->asset_id,
                    'category_id' => $item->category_id,
                ];
            })->values()->all(),
        ];
    }

    private function notifySupplier(PurchaseOrder $order): array
    {
        $order->loadMissing(['supplier:id,code,name,contact_person,email', 'items']);
        $email = $order->supplier?->email;

        if (!$email) {
            return [
                'status' => 'skipped',
                'message' => 'Nhà cung cấp chưa có email để nhận thông báo.',
            ];
        }

        try {
            Mail::raw(
                "Đơn hàng {$order->order_code} đã được tạo cho nhà cung cấp {$order->supplier->name}.",
                function ($message) use ($email, $order) {
                    $message->to($email)
                        ->subject("Thông báo đơn hàng {$order->order_code}");
                }
            );

            return [
                'status' => 'sent',
                'message' => 'Thông báo nhà cung cấp đã được gửi qua mailer hiện tại.',
            ];
        } catch (Throwable $exception) {
            Log::warning('Purchase order supplier notification failed.', [
                'purchase_order_id' => $order->id,
                'supplier_id' => $order->supplier_id,
                'error' => $exception->getMessage(),
            ]);

            return [
                'status' => 'failed',
                'message' => 'Tạo đơn hàng thành công nhưng chưa gửi được thông báo nhà cung cấp.',
            ];
        }
    }
}
