<?php

namespace App\Http\Requests;

use App\Models\Feedback;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // All authenticated users can create feedback
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'asset_id' => ['nullable', 'integer', 'exists:assets,id'],
            'maintenance_event_id' => ['nullable', 'integer', 'exists:maintenance_events,id'],
            'content' => ['required', 'string', 'min:10', 'max:5000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'type' => ['sometimes', Rule::in(Feedback::TYPES)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Nội dung phản hồi là bắt buộc.',
            'content.min' => 'Nội dung phản hồi phải có ít nhất 10 ký tự.',
            'content.max' => 'Nội dung phản hồi không được vượt quá 5000 ký tự.',
            'rating.min' => 'Đánh giá phải từ 1 đến 5.',
            'rating.max' => 'Đánh giá phải từ 1 đến 5.',
            'asset_id.exists' => 'Tài sản không tồn tại.',
            'maintenance_event_id.exists' => 'Sự kiện bảo trì không tồn tại.',
        ];
    }
}
