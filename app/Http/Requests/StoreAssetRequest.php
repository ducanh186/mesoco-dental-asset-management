<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'asset_code' => ['nullable', 'string', 'max:50', 'unique:assets,asset_code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(Asset::TYPES)],
            'status' => ['sometimes', 'string', Rule::in(Asset::STATUSES)],
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
