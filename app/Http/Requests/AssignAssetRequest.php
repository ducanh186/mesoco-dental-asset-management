<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignAssetRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (!$this->filled('staff_id') && $this->filled('user_id')) {
            $this->merge([
                'staff_id' => $this->input('user_id'),
            ]);
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
        return [
            'staff_id' => ['nullable', 'integer', 'exists:users,id', 'required_without:employee_id'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,id', 'required_without:staff_id'],
            'department_name' => ['nullable', 'string', 'max:150'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'staff_id.required_without' => 'Vui lòng chọn người nhận thiết bị.',
            'staff_id.exists' => 'Người nhận thiết bị không tồn tại.',
            'employee_id.required' => 'Vui lòng chọn nhân viên chịu trách nhiệm.',
            'employee_id.exists' => 'Nhân viên được chọn không tồn tại.',
        ];
    }
}
