<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query()->withCount(['assets', 'repairLogs', 'purchaseOrders']);

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortDir = $request->get('sort_dir', 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['name', 'code', 'created_at'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $suppliers = $query->paginate(min($request->integer('per_page', 25), 100));

        return response()->json($suppliers);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = Supplier::create($request->validated());

        return response()->json([
            'message' => 'Supplier created successfully.',
            'data' => $supplier,
        ], 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        $supplier->loadCount(['assets', 'repairLogs', 'purchaseOrders']);

        return response()->json([
            'data' => $supplier,
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($request->validated());

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'data' => $supplier->fresh()->loadCount(['assets', 'repairLogs', 'purchaseOrders']),
        ]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->loadCount(['assets', 'repairLogs', 'purchaseOrders']);

        if (($supplier->assets_count + $supplier->repair_logs_count + $supplier->purchase_orders_count) > 0) {
            return response()->json([
                'message' => 'Cannot delete supplier that is already linked to assets, repairs, or purchase orders.',
                'data' => [
                    'assets_count' => $supplier->assets_count,
                    'repair_logs_count' => $supplier->repair_logs_count,
                    'purchase_orders_count' => $supplier->purchase_orders_count,
                ],
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully.',
        ]);
    }

    public function dropdown(): JsonResponse
    {
        $suppliers = Supplier::query()
            ->orderBy('name')
            ->select(['id', 'code', 'name'])
            ->get();

        return response()->json([
            'data' => $suppliers,
        ]);
    }
}
