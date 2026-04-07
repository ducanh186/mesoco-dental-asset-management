<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * StoreUserRequest
 * 
 * Validates user account creation requests.
 * 
 * RBAC Policy:
 * - Manager: Can create user with any canonical role
 * - Technician: Can create user but CANNOT set role (defaults to 'employee')
 *   Manager must assign elevated roles later via updateRole endpoint
 * 
 * This prevents HR from "indirectly assigning roles" during creation.
 */
class StoreUserRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'employee_id' => [
                'required',
                'integer',
                'exists:employees,id',
                Rule::unique('users', 'employee_id'), // Each employee can have only ONE user account
            ],
            'default_password' => [
                'required',
                'string',
                Password::min(8),
            ],
        ];

        if ($this->user()->canManageUsers()) {
            $rules['role'] = [
                'required',
                'string',
                Rule::in(User::ROLES),
            ];
        }

        return $rules;
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

    /**
     * Get the validated data with defaults applied.
     * Technicians get default role 'employee' since they cannot set role.
     */
    public function validated($key = null, $default = null): mixed
    {
        $validated = parent::validated($key, $default);
        
        if (!$this->user()->canManageUsers() && !isset($validated['role'])) {
            $validated['role'] = User::ROLE_EMPLOYEE;
        }
        
        return $validated;
    }
}
