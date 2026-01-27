<?php

namespace App\Http\Requests;

use App\Models\MaintenanceEvent;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for completing a MaintenanceEvent.
 * 
 * Phase 7: Maintenance completion with results.
 */
class CompleteMaintenanceEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('maintenanceEvent');
        return $this->user()?->can('complete', $event) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'result_note' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'cost' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999.99',
            ],
            'actual_duration_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:10080',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'result_note' => 'kết quả bảo trì',
            'cost' => 'chi phí',
            'actual_duration_minutes' => 'thời gian thực tế (phút)',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'cost.min' => 'Chi phí không được âm.',
            'cost.max' => 'Chi phí vượt quá giới hạn cho phép.',
            'actual_duration_minutes.min' => 'Thời gian thực tế phải lớn hơn 0.',
        ];
    }
}
