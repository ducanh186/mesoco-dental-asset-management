<?php

namespace App\Http\Requests;

use App\Models\Feedback;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFeedbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $feedback = $this->route('feedback');
        return $this->user()->can('update', $feedback);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isManager = $this->user()->hasAnyRole(['admin', 'hr', 'technician']);

        $rules = [];

        // Owner can update content if status is new
        if (!$isManager) {
            $rules['content'] = ['sometimes', 'string', 'min:10', 'max:5000'];
            $rules['rating'] = ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'];
        } else {
            // Managers can update status, response
            $rules['status'] = ['sometimes', Rule::in(Feedback::STATUSES)];
            $rules['response'] = ['sometimes', 'nullable', 'string', 'max:5000'];
            $rules['content'] = ['sometimes', 'string', 'min:10', 'max:5000'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.min' => 'Nội dung phản hồi phải có ít nhất 10 ký tự.',
            'content.max' => 'Nội dung phản hồi không được vượt quá 5000 ký tự.',
            'response.max' => 'Phản hồi không được vượt quá 5000 ký tự.',
            'status.in' => 'Trạng thái không hợp lệ.',
        ];
    }
}
