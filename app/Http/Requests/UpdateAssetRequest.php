<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merged = [];

        if (!$this->filled('purchase_cost') && $this->filled('purchase_price')) {
            $merged['purchase_cost'] = $this->input('purchase_price');
        }

        if (!$this->filled('depreciation_rate') && $this->filled('current_depreciation_rate')) {
            $merged['depreciation_rate'] = $this->input('current_depreciation_rate');
        }

        if ($this->filled('status')) {
            $merged['status'] = Asset::normalizeStatusInput($this->input('status'));
        }

        if ($merged !== []) {
            $this->merge($merged);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasOperationalAccess();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $assetId = $this->route('asset')?->id ?? $this->route('asset');

        return [
            'asset_code' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('assets', 'asset_code')->ignore($assetId),
            ],
            'serial_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
                Rule::unique('assets', 'serial_number')->ignore($assetId),
            ],
            'name' => ['sometimes', 'string', 'max:255'],
            'model' => ['sometimes', 'nullable', 'string', 'max:150'],
            'configuration' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'type' => ['sometimes', 'string', Rule::in(Asset::TYPES)],
            'category' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'status' => ['sometimes', 'string', Rule::in(Asset::STATUSES)],
            'qr_code' => ['sometimes', 'nullable', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'useful_life_months' => ['nullable', 'integer', 'min:1', 'max:600'],
            'salvage_value' => ['nullable', 'numeric', 'min:0'],
            'current_depreciation_rate' => ['nullable', 'numeric', 'min:0'],
            'warranty_expiry' => ['nullable', 'date'],
            'warranty_period_months' => ['nullable', 'integer', 'min:0', 'max:600'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'instructions_url' => ['nullable', 'string', 'max:2000', 'url:http,https'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'asset_code.unique' => 'This asset code already exists.',
            'type.in' => 'Invalid asset type. Valid types: ' . implode(', ', Asset::TYPES),
            'status.in' => 'Invalid status. Valid statuses: ' . implode(', ', Asset::STATUSES),
        ];
    }
}
