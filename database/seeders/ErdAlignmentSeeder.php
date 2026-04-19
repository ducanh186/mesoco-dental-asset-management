<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Disposal;
use App\Models\MaintenanceDetail;
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
        $this->syncMaintenanceAssignmentsAndDetails();
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

    private function syncMaintenanceAssignmentsAndDetails(): void
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

            if ($event->type === MaintenanceEvent::TYPE_REPAIR || $event->detail()->exists() || $event->repairLog()->exists()) {
                $detailData = [
                    'asset_id' => $event->asset_id,
                    'technician_user_id' => $assignedUserId,
                    'status' => $event->status,
                    'issue_description' => $event->note,
                    'action_taken' => $event->result_note,
                    'cost' => $event->cost,
                    'started_at' => $event->started_at,
                    'completed_at' => $event->completed_at,
                    'logged_at' => $event->completed_at ?? $event->started_at ?? $event->planned_at,
                ];

                MaintenanceDetail::query()->updateOrCreate(
                    ['maintenance_event_id' => $event->id],
                    $detailData
                );

                RepairLog::query()->updateOrCreate(
                    ['maintenance_event_id' => $event->id],
                    $detailData
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

            $disposal = $asset->disposals()->create([
                'code' => Disposal::generateCode(),
                'method' => 'destroy',
                'reason' => $asset->off_service_reason ?: 'Seeded from retired asset status',
                'disposed_by_user_id' => $asset->off_service_set_by,
                'approved_by_user_id' => $asset->off_service_set_by,
                'disposed_at' => $asset->off_service_from ?? now(),
                'asset_book_value' => $asset->getCurrentBookValue(),
                'note' => 'Backfilled by ErdAlignmentSeeder',
            ]);

            $disposal->details()->create([
                'asset_id' => $asset->id,
                'condition_summary' => $disposal->reason,
                'asset_book_value' => $disposal->asset_book_value,
                'proceeds_amount' => $disposal->proceeds_amount,
                'processed_at' => $disposal->disposed_at,
                'note' => $disposal->note,
            ]);
        }
    }
}
