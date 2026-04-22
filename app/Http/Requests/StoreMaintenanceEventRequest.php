<?php

namespace App\Http\Requests;

use App\Models\MaintenanceEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request for creating a new MaintenanceEvent.
 * 
 * Phase 7: Maintenance scheduling.
 */
class StoreMaintenanceEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', MaintenanceEvent::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'asset_id' => [
                'nullable',
                'integer',
                'exists:assets,id',
                'required_without:details',
            ],
            'details' => [
                'nullable',
                'array',
                'min:1',
                'required_without:asset_id',
            ],
            'details.*.asset_id' => [
                'required_with:details',
                'integer',
                'exists:assets,id',
                'distinct',
            ],
            'details.*.qty' => [
                'required_with:details',
                'integer',
                'min:1',
                'max:9999',
            ],
            'type' => [
                'required',
                'string',
                Rule::in(MaintenanceEvent::TYPES),
            ],
            'planned_at' => [
                'required',
                'date',
                'after_or_equal:now',
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
                'max:10080', // max 1 week
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'asset_id' => 'tài sản',
            'details' => 'chi tiết bảo trì',
            'details.*.asset_id' => 'thiết bị trong chi tiết',
            'details.*.qty' => 'số lượng thiết bị',
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
            'asset_id.required' => 'Vui lòng chọn tài sản cần bảo trì.',
            'asset_id.exists' => 'Tài sản không tồn tại.',
            'details.required_without' => 'Vui lòng thêm ít nhất một dòng chi tiết bảo trì.',
            'details.min' => 'Phiếu bảo trì phải có ít nhất một thiết bị.',
            'details.*.asset_id.required_with' => 'Mỗi dòng chi tiết phải chọn thiết bị.',
            'details.*.asset_id.distinct' => 'Không được chọn trùng thiết bị trong cùng một phiếu bảo trì.',
            'details.*.qty.required_with' => 'Vui lòng nhập số lượng cho từng thiết bị.',
            'details.*.qty.min' => 'Số lượng phải lớn hơn 0.',
            'type.required' => 'Vui lòng chọn loại bảo trì.',
            'type.in' => 'Loại bảo trì không hợp lệ.',
            'planned_at.required' => 'Vui lòng chọn thời gian dự kiến.',
            'planned_at.after_or_equal' => 'Thời gian dự kiến không được ở quá khứ.',
            'priority.in' => 'Mức độ ưu tiên không hợp lệ.',
        ];
    }
}
