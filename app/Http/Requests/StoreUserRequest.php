<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * StoreUserRequest
 * 
 * Validates user account creation requests (Roles & Permission - Admin/HR only).
 * Creates a user account linked to an existing employee.
 */
class StoreUserRequest extends FormRequest
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
            'employee_id' => [
                'required',
                'integer',
                'exists:employees,id',
                Rule::unique('users', 'employee_id'), // Each employee can have only ONE user account
            ],
            'role' => [
                'required',
                'string',
                Rule::in(User::ROLES),
            ],
            'default_password' => [
                'required',
                'string',
                Password::min(8),
            ],
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
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'The selected employee does not exist.',
            'employee_id.unique' => 'This employee already has a user account.',
            'role.required' => 'Please select a role.',
            'role.in' => 'Invalid role selected. Must be one of: ' . implode(', ', User::ROLES),
            'default_password.required' => 'The default password is required.',
            'default_password.min' => 'The default password must be at least 8 characters.',
        ];
    }
}
