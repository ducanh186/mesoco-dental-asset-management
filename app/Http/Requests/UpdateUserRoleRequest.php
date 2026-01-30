<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateUserRoleRequest
 * 
 * Validates user role update requests (Roles & Permission - Admin/HR only).
 * Only role is editable - employee_code and name are read-only.
 */
class UpdateUserRoleRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role' => [
                'required',
                'string',
                Rule::in(User::ROLES),
            ],
            // FORBIDDEN FIELDS - must reject with 422 if sent
            'employee_code' => ['prohibited'],
            'name' => ['prohibited'],
            'email' => ['prohibited'],
            'password' => ['prohibited'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.required' => 'Please select a role.',
            'role.in' => 'Invalid role selected. Must be one of: ' . implode(', ', User::ROLES),
            'employee_code.prohibited' => 'The employee_code field cannot be modified.',
            'name.prohibited' => 'The name field cannot be modified.',
            'email.prohibited' => 'The email field cannot be modified.',
            'password.prohibited' => 'The password field cannot be modified via this endpoint.',
        ];
    }
}
