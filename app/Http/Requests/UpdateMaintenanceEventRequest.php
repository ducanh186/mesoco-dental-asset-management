<?php

namespace App\Http\Requests;

use App\Models\MaintenanceEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request for updating a MaintenanceEvent.
 * 
 * Phase 7: Maintenance scheduling.
 */
class UpdateMaintenanceEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('maintenanceEvent');
        return $this->user()?->can('update', $event) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => [
                'sometimes',
                'string',
                Rule::in(MaintenanceEvent::TYPES),
            ],
            'planned_at' => [
                'sometimes',
                'date',
            ],
            'priority' => [
                'sometimes',
                'string',
                Rule::in(MaintenanceEvent::PRIORITIES),
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'assigned_to' => [
                'nullable',
                'string',
                'max:255',
            ],
            'assigned_to_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'estimated_duration_minutes' => [
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
            'type' => 'loại bảo trì',
            'planned_at' => 'thời gian dự kiến',
            'priority' => 'mức độ ưu tiên',
            'note' => 'ghi chú',
            'assigned_to' => 'người phụ trách',
            'assigned_to_user_id' => 'người phụ trách',
            'estimated_duration_minutes' => 'thời gian dự kiến (phút)',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Loại bảo trì không hợp lệ.',
            'priority.in' => 'Mức độ ưu tiên không hợp lệ.',
        ];
    }
}
