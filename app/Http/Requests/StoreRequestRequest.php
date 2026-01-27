<?php

namespace App\Http\Requests;

use App\Models\AssetRequest;
use App\Models\RequestItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User must have an employee record to create requests
        return $this->user()->employee !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'type' => ['required', 'string', Rule::in(AssetRequest::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'severity' => ['nullable', 'string', Rule::in(AssetRequest::SEVERITIES)],
            
            // Items array
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.item_kind' => ['required_with:items', 'string', Rule::in(RequestItem::KINDS)],
            'items.*.asset_id' => ['nullable', 'integer', 'exists:assets,id'],
            'items.*.sku' => ['nullable', 'string', 'max:50'],
            'items.*.name' => ['nullable', 'string', 'max:255'],
            'items.*.qty' => ['nullable', 'numeric', 'min:0.01', 'max:99999'],
            'items.*.unit' => ['nullable', 'string', 'max:30'],
            'items.*.from_shift_id' => ['nullable', 'integer', 'exists:shifts,id'],
            'items.*.to_shift_id' => ['nullable', 'integer', 'exists:shifts,id'],
            'items.*.from_date' => ['nullable', 'date', 'after_or_equal:today'],
            'items.*.to_date' => ['nullable', 'date', 'after_or_equal:items.*.from_date'],
            'items.*.note' => ['nullable', 'string', 'max:1000'],
        ];

        // Add type-specific rules
        $type = $this->input('type');

        if ($type === AssetRequest::TYPE_JUSTIFICATION) {
            $rules['severity'] = ['required', 'string', Rule::in(AssetRequest::SEVERITIES)];
            $rules['incident_at'] = ['nullable', 'date', 'before_or_equal:now'];
            $rules['suspected_cause'] = ['nullable', 'string', Rule::in(AssetRequest::SUSPECTED_CAUSES)];
            // JUSTIFICATION should have at least one ASSET item
            $rules['items'] = ['required', 'array', 'min:1'];
        }

        if ($type === AssetRequest::TYPE_ASSET_LOAN) {
            // ASSET_LOAN must have ASSET items with shift/date range
            $rules['items'] = ['required', 'array', 'min:1'];
        }

        if ($type === AssetRequest::TYPE_CONSUMABLE_REQUEST) {
            // CONSUMABLE_REQUEST must have CONSUMABLE items
            $rules['items'] = ['required', 'array', 'min:1'];
        }

        return $rules;
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Invalid request type. Valid types: ' . implode(', ', AssetRequest::TYPES),
            'severity.in' => 'Invalid severity. Valid values: ' . implode(', ', AssetRequest::SEVERITIES),
            'severity.required' => 'Severity is required for justification requests.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.item_kind.in' => 'Invalid item kind. Valid values: ' . implode(', ', RequestItem::KINDS),
            'items.*.asset_id.exists' => 'The selected asset does not exist.',
            'items.*.from_shift_id.exists' => 'The selected shift does not exist.',
            'items.*.to_shift_id.exists' => 'The selected shift does not exist.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateItemsForType($validator);
        });
    }

    /**
     * Validate items based on request type.
     * Optimized to avoid N+1 queries by batch loading assets.
     */
    private function validateItemsForType($validator): void
    {
        $type = $this->input('type');
        $items = $this->input('items', []);
        $user = $this->user();
        $employeeId = $user->employee?->id;

        if (empty($items)) {
            return;
        }

        // Collect all asset_ids for batch query (avoid N+1)
        $assetIds = collect($items)
            ->pluck('asset_id')
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        // Batch load all assets with currentAssignment in one query
        $assetsMap = [];
        if (!empty($assetIds)) {
            $assetsMap = \App\Models\Asset::with('currentAssignment')
                ->whereIn('id', $assetIds)
                ->get()
                ->keyBy('id');
        }

        foreach ($items as $index => $item) {
            $itemKind = $item['item_kind'] ?? null;

            // JUSTIFICATION requires ASSET items with asset_id
            if ($type === AssetRequest::TYPE_JUSTIFICATION) {
                if ($itemKind !== RequestItem::KIND_ASSET) {
                    $validator->errors()->add(
                        "items.{$index}.item_kind",
                        'Yêu cầu báo cáo sự cố phải chọn loại TÀI SẢN.'
                    );
                }
                
                $assetId = $item['asset_id'] ?? null;
                if (empty($assetId)) {
                    $validator->errors()->add(
                        "items.{$index}.asset_id",
                        'Vui lòng chọn tài sản cần báo cáo.'
                    );
                } else {
                    // Check ownership using preloaded assets map
                    $asset = $assetsMap[$assetId] ?? null;
                    
                    if (!$asset) {
                        $validator->errors()->add(
                            "items.{$index}.asset_id",
                            'Tài sản được chọn không tồn tại.'
                        );
                    } elseif (!$asset->isAssignedToEmployee($employeeId)) {
                        $validator->errors()->add(
                            "items.{$index}.asset_id",
                            'Bạn chỉ có thể báo cáo sự cố cho tài sản đã được giao cho mình.'
                        );
                    }
                }
            }

            // ASSET_LOAN requires ASSET items with shift/date range
            if ($type === AssetRequest::TYPE_ASSET_LOAN && $itemKind === RequestItem::KIND_ASSET) {
                $assetId = $item['asset_id'] ?? null;
                if (empty($assetId)) {
                    $validator->errors()->add(
                        "items.{$index}.asset_id",
                        'Vui lòng chọn tài sản cần mượn.'
                    );
                } else {
                    // Check availability using preloaded assets map
                    $asset = $assetsMap[$assetId] ?? null;
                    
                    if (!$asset) {
                        $validator->errors()->add(
                            "items.{$index}.asset_id",
                            'Tài sản được chọn không tồn tại.'
                        );
                    } elseif (!$asset->isAvailableForLoan()) {
                        // Provide specific error message based on reason
                        if ($asset->status !== \App\Models\Asset::STATUS_ACTIVE) {
                            $validator->errors()->add(
                                "items.{$index}.asset_id",
                                'Tài sản không khả dụng để mượn (trạng thái: ' . $asset->status . ').'
                            );
                        } else {
                            $validator->errors()->add(
                                "items.{$index}.asset_id",
                                'Tài sản đã được giao cho người khác và không khả dụng để mượn.'
                            );
                        }
                    }
                }
                
                // Must have either shift range or date range
                $hasShiftRange = !empty($item['from_shift_id']) && !empty($item['to_shift_id']);
                $hasDateRange = !empty($item['from_date']) && !empty($item['to_date']);
                if (!$hasShiftRange && !$hasDateRange) {
                    $validator->errors()->add(
                        "items.{$index}",
                        'Yêu cầu mượn tài sản phải có khoảng ca làm hoặc khoảng ngày.'
                    );
                }
            }

            // CONSUMABLE_REQUEST requires CONSUMABLE items with name and qty
            if ($type === AssetRequest::TYPE_CONSUMABLE_REQUEST) {
                if ($itemKind !== RequestItem::KIND_CONSUMABLE) {
                    $validator->errors()->add(
                        "items.{$index}.item_kind",
                        'Yêu cầu vật tư tiêu hao phải chọn loại VẬT TƯ.'
                    );
                }
                if (empty($item['name']) && empty($item['sku'])) {
                    $validator->errors()->add(
                        "items.{$index}.name",
                        'Vui lòng nhập tên hoặc mã SKU của vật tư.'
                    );
                }
                if (empty($item['qty'])) {
                    $validator->errors()->add(
                        "items.{$index}.qty",
                        'Vui lòng nhập số lượng cần yêu cầu.'
                    );
                }
            }
        }
    }
}
