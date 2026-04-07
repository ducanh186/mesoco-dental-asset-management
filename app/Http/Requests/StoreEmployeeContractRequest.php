<?php

namespace App\Http\Requests;

use App\Models\EmployeeContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreEmployeeContractRequest
 * 
 * Validates contract creation requests (Admin only).
 */
class StoreEmployeeContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Admin-only access.
     */
    public function authorize(): bool
    {
        return $this->user()?->canManageUsers() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department' => ['nullable', 'string', 'max:255'],
            'contract_type' => ['required', 'string', Rule::in(EmployeeContract::TYPES)],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'string', Rule::in(EmployeeContract::STATUSES)],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'], // 10MB max
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
            'contract_type.required' => 'The contract type is required.',
            'contract_type.in' => 'The contract type must be one of: ' . implode(', ', EmployeeContract::TYPES) . '.',
            'start_date.required' => 'The start date is required.',
            'start_date.date' => 'The start date must be a valid date.',
            'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'status.in' => 'The status must be one of: ' . implode(', ', EmployeeContract::STATUSES) . '.',
            'pdf.mimes' => 'The file must be a PDF document.',
            'pdf.max' => 'The PDF file must not exceed 10MB.',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new \Illuminate\Auth\Access\AuthorizationException(
            'Only managers can manage contracts.'
        );
    }
}
