<?php

namespace App\Http\Requests;

use App\Models\Employee;
use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateProfileRequest
 * 
 * Validates profile update requests.
 * CRITICAL: Rejects employee_code and email if sent - these are IMMUTABLE.
 */
class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->user()?->isSupplier()) {
            return [
                'name' => ['sometimes', 'string', 'max:150'],
                'contact_person' => ['sometimes', 'nullable', 'string', 'max:255'],
                'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
                'address' => ['sometimes', 'nullable', 'string', 'max:1000'],
                'note' => ['sometimes', 'nullable', 'string'],

                'supplier_code' => ['prohibited'],
                'email' => ['prohibited'],
                'full_name' => ['prohibited'],
                'position' => ['prohibited'],
                'dob' => ['prohibited'],
                'gender' => ['prohibited'],
                'employee_code' => ['prohibited'],
            ];
        }

        return [
            // Editable fields
            'full_name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'nullable', 'string', 'max:255'],
            'dob' => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender' => ['sometimes', 'nullable', Rule::in(['male', 'female', 'other'])],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],

            // FORBIDDEN FIELDS - must reject with 422 if sent
            'employee_code' => ['prohibited'],
            'email' => ['prohibited'],
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
            'employee_code.prohibited' => 'The employee_code field cannot be modified.',
            'supplier_code.prohibited' => 'The supplier_code field cannot be modified.',
            'email.prohibited' => 'The email field cannot be modified.',
            'dob.before' => 'The date of birth must be a date before today.',
            'gender.in' => 'The gender must be one of: male, female, other.',
        ];
    }

    /**
     * Get only the allowed fields for update.
     */
    public function safeData(): array
    {
        if ($this->user()?->isSupplier()) {
            return $this->only(Supplier::PROFILE_EDITABLE_FIELDS);
        }

        return $this->only(Employee::PROFILE_EDITABLE_FIELDS);
    }
}
