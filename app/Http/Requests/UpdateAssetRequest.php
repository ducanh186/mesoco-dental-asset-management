<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
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
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', Rule::in(Asset::TYPES)],
            'status' => ['sometimes', 'string', Rule::in(Asset::STATUSES)],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
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
