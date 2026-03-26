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
 * - Admin: Can create user with any role
 * - HR: Can create user but CANNOT set role (defaults to 'staff')
 *       Admin must assign role later via updateRole endpoint
 * 
 * This prevents HR from "indirectly assigning roles" during creation.
 */
class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Admin or HR can create users.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isHr();
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

        // Only Admin can set role during creation
        // HR creates user with default role 'staff', Admin assigns proper role later
        if ($this->user()->isAdmin()) {
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
     * HR users get default role 'staff' since they cannot set role.
     */
    public function validated($key = null, $default = null): mixed
    {
        $validated = parent::validated($key, $default);
        
        // If HR is creating user (no role in request), default to 'staff'
        if (!$this->user()->isAdmin() && !isset($validated['role'])) {
            $validated['role'] = 'staff';
        }
        
        return $validated;
    }
}
