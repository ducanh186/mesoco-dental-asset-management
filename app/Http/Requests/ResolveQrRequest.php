<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResolveQrRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * All authenticated users can resolve QR codes.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'payload' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payload.required' => 'QR payload is required.',
            'payload.max' => 'QR payload is too long.',
        ];
    }
}
