<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignAssetRequest extends FormRequest
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
        return [
            'employee_id' => ['nullable', 'integer', 'exists:employees,id', 'required_without:department_name'],
            'department_name' => ['nullable', 'string', 'max:150', 'required_without:employee_id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'employee_id.required_without' => 'Vui lòng chọn nhân viên hoặc nhập phòng ban nhận bàn giao.',
            'employee_id.exists' => 'Nhân viên được chọn không tồn tại.',
            'department_name.required_without' => 'Vui lòng nhập phòng ban nhận bàn giao.',
        ];
    }
}
