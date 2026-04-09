<?php

namespace App\Http\Requests;

use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasOperationalAccess();
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'order_date' => ['required', 'date'],
            'expected_delivery_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:order_date'],
            'status' => ['required', 'string', Rule::in(PurchaseOrder::statusOptions())],
            'payment_method' => ['sometimes', 'nullable', 'string', 'max:100'],
            'note' => ['sometimes', 'nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.qty' => ['required', 'numeric', 'gt:0'],
            'items.*.unit' => ['sometimes', 'nullable', 'string', 'max:30'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.asset_id' => ['sometimes', 'nullable', 'integer', 'exists:assets,id'],
            'items.*.category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'items.*.note' => ['sometimes', 'nullable', 'string'],
            'items.*.line_total' => ['prohibited'],
        ];
    }
}
