<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\Category;
use App\Models\Disposal;
use App\Models\MaintenanceEvent;
use App\Models\RepairLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ErdAlignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->syncRoles();
        $this->syncCategories();
        $this->syncRequestPrimaryAssetsAndApprovals();
        $this->syncMaintenanceAssignmentsAndRepairLogs();
        $this->syncDisposals();
    }

    private function syncRoles(): void
    {
        foreach (User::query()->cursor() as $user) {
            $normalizedRole = User::normalizeRole($user->role);

            $role = Role::query()->firstOrCreate(
                ['code' => $normalizedRole],
                ['name' => User::roleLabel($normalizedRole)]
            );

            $user->forceFill([
                'role' => $normalizedRole,
                'role_id' => $role->id,
            ])->save();
        }
    }

    private function syncCategories(): void
    {
        foreach (Asset::query()->whereNotNull('category')->cursor() as $asset) {
            $category = Category::query()->firstOrCreate(
                ['code' => Str::slug($asset->category, '_')],
                ['name' => $asset->category]
            );

            if ($asset->category_id !== $category->id) {
                $asset->forceFill(['category_id' => $category->id])->save();
            }
        }
    }

    private function syncRequestPrimaryAssetsAndApprovals(): void
    {
        foreach (AssetRequest::query()->with('items')->cursor() as $request) {
            $primaryAssetId = $request->items
                ->pluck('asset_id')
                ->filter()
                ->first();

            if ($primaryAssetId && $request->asset_id !== $primaryAssetId) {
                $request->forceFill(['asset_id' => $primaryAssetId])->save();
            }

            if (
                $request->reviewed_by_user_id &&
                in_array($request->status, [AssetRequest::STATUS_APPROVED, AssetRequest::STATUS_REJECTED], true)
            ) {
                $status = $request->status === AssetRequest::STATUS_APPROVED ? 'approved' : 'rejected';

                $request->approvals()->firstOrCreate(
                    [
                        'reviewer_user_id' => $request->reviewed_by_user_id,
                        'status' => $status,
                    ],
                    [
                        'note' => $request->review_note,
                        'acted_at' => $request->reviewed_at,
                    ]
                );
            }
        }
    }

    private function syncMaintenanceAssignmentsAndRepairLogs(): void
    {
        foreach (MaintenanceEvent::query()->cursor() as $event) {
            $assignedUserId = $event->assigned_to_user_id;

            if (!$assignedUserId && $event->assigned_to) {
                $assignedUserId = User::query()
                    ->where('name', $event->assigned_to)
                    ->orWhere('email', $event->assigned_to)
                    ->value('id');
            }

            if ($assignedUserId !== $event->assigned_to_user_id) {
                $event->forceFill(['assigned_to_user_id' => $assignedUserId])->save();
            }

            if ($event->type === MaintenanceEvent::TYPE_REPAIR || $event->repairLog()->exists()) {
                RepairLog::query()->updateOrCreate(
                    ['maintenance_event_id' => $event->id],
                    [
                        'asset_id' => $event->asset_id,
                        'technician_user_id' => $assignedUserId,
                        'status' => $event->status,
                        'issue_description' => $event->note,
                        'action_taken' => $event->result_note,
                        'cost' => $event->cost,
                        'started_at' => $event->started_at,
                        'completed_at' => $event->completed_at,
                        'logged_at' => $event->completed_at ?? $event->started_at ?? $event->planned_at,
                    ]
                );
            }
        }
    }

    private function syncDisposals(): void
    {
        foreach (Asset::query()->where('status', Asset::STATUS_RETIRED)->cursor() as $asset) {
            if ($asset->disposals()->exists()) {
                continue;
            }

            $asset->disposals()->create([
                'code' => Disposal::generateCode(),
                'method' => 'destroy',
                'reason' => $asset->off_service_reason ?: 'Seeded from retired asset status',
                'disposed_by_user_id' => $asset->off_service_set_by,
                'approved_by_user_id' => $asset->off_service_set_by,
                'disposed_at' => $asset->off_service_from ?? now(),
                'asset_book_value' => $asset->getCurrentBookValue(),
                'note' => 'Backfilled by ErdAlignmentSeeder',
            ]);
        }
    }
}
