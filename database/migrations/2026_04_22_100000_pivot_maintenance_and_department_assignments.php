<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_assignments', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->change();
        });

        if (!Schema::hasColumn('asset_assignments', 'department_name')) {
            Schema::table('asset_assignments', function (Blueprint $table) {
                $table->string('department_name', 150)->nullable()->after('employee_id');
            });
        }

        if (!$this->indexExists('asset_assignments', 'asset_assignments_department_active_idx')) {
            Schema::table('asset_assignments', function (Blueprint $table) {
                $table->index(['department_name', 'unassigned_at'], 'asset_assignments_department_active_idx');
            });
        }

        foreach (
            DB::table('asset_assignments')
                ->leftJoin('employees', 'employees.id', '=', 'asset_assignments.employee_id')
                ->select('asset_assignments.id', 'employees.department')
                ->whereNull('asset_assignments.department_name')
                ->cursor() as $assignment
        ) {
            if (!$assignment->department) {
                continue;
            }

            DB::table('asset_assignments')
                ->where('id', $assignment->id)
                ->update(['department_name' => $assignment->department]);
        }

        if (!Schema::hasColumn('maintenance_details', 'qty')) {
            Schema::table('maintenance_details', function (Blueprint $table) {
                $table->unsignedInteger('qty')->default(1)->after('asset_id');
            });
        }

        $this->replaceMaintenanceDetailUniqueIndex();
    }

    public function down(): void
    {
        foreach (
            DB::table('maintenance_details')
                ->select('maintenance_event_id')
                ->groupBy('maintenance_event_id')
                ->havingRaw('COUNT(*) > 1')
                ->cursor() as $group
        ) {
            $detailIdsToDelete = DB::table('maintenance_details')
                ->where('maintenance_event_id', $group->maintenance_event_id)
                ->orderBy('id')
                ->skip(1)
                ->pluck('id');

            if ($detailIdsToDelete->isNotEmpty()) {
                DB::table('maintenance_details')
                    ->whereIn('id', $detailIdsToDelete)
                    ->delete();
            }
        }

        $droppedMaintenanceEventForeign = $this->dropMaintenanceEventForeignIfNeeded();

        Schema::table('maintenance_details', function (Blueprint $table) {
            if ($this->indexExists('maintenance_details', 'maintenance_details_event_asset_unique')) {
                $table->dropUnique('maintenance_details_event_asset_unique');
            }

            if (Schema::hasColumn('maintenance_details', 'qty')) {
                $table->dropColumn('qty');
            }
        });

        if (!$this->indexExists('maintenance_details', 'maintenance_details_maintenance_event_id_unique')) {
            Schema::table('maintenance_details', function (Blueprint $table) {
                $table->unique('maintenance_event_id');
            });
        }

        if ($droppedMaintenanceEventForeign) {
            $this->restoreMaintenanceEventForeignIfMissing();
        }

        DB::table('asset_assignments')
            ->whereNull('employee_id')
            ->delete();

        Schema::table('asset_assignments', function (Blueprint $table) {
            if ($this->indexExists('asset_assignments', 'asset_assignments_department_active_idx')) {
                $table->dropIndex('asset_assignments_department_active_idx');
            }

            if (Schema::hasColumn('asset_assignments', 'department_name')) {
                $table->dropColumn('department_name');
            }

            $table->foreignId('employee_id')->nullable(false)->change();
        });
    }

    private function replaceMaintenanceDetailUniqueIndex(): void
    {
        $droppedMaintenanceEventForeign = false;

        if ($this->indexExists('maintenance_details', 'maintenance_details_maintenance_event_id_unique')) {
            $droppedMaintenanceEventForeign = $this->dropMaintenanceEventForeignIfNeeded();

            Schema::table('maintenance_details', function (Blueprint $table) {
                $table->dropUnique('maintenance_details_maintenance_event_id_unique');
            });
        }

        if (!$this->indexExists('maintenance_details', 'maintenance_details_event_asset_unique')) {
            Schema::table('maintenance_details', function (Blueprint $table) {
                $table->unique(
                    ['maintenance_event_id', 'asset_id'],
                    'maintenance_details_event_asset_unique'
                );
            });
        }

        if ($droppedMaintenanceEventForeign) {
            $this->restoreMaintenanceEventForeignIfMissing();
        }
    }

    private function dropMaintenanceEventForeignIfNeeded(): bool
    {
        if (
            DB::getDriverName() !== 'mysql'
            || !$this->foreignKeyExists(
                'maintenance_details',
                'maintenance_details_maintenance_event_id_foreign'
            )
        ) {
            return false;
        }

        Schema::table('maintenance_details', function (Blueprint $table) {
            $table->dropForeign('maintenance_details_maintenance_event_id_foreign');
        });

        return true;
    }

    private function restoreMaintenanceEventForeignIfMissing(): void
    {
        if (
            DB::getDriverName() !== 'mysql'
            || $this->foreignKeyExists(
                'maintenance_details',
                'maintenance_details_maintenance_event_id_foreign'
            )
        ) {
            return;
        }

        Schema::table('maintenance_details', function (Blueprint $table) {
            $table
                ->foreign('maintenance_event_id', 'maintenance_details_maintenance_event_id_foreign')
                ->references('id')
                ->on('maintenance_events')
                ->cascadeOnDelete();
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        if (method_exists(Schema::getFacadeRoot(), 'getIndexes')) {
            try {
                foreach (Schema::getIndexes($table) as $existingIndex) {
                    if (($existingIndex['name'] ?? null) === $index) {
                        return true;
                    }
                }

                return false;
            } catch (\Throwable) {
                // Fall through to driver-specific checks below.
            }
        }

        if (DB::getDriverName() === 'mysql') {
            return DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index]) !== [];
        }

        if (DB::getDriverName() === 'sqlite') {
            foreach (DB::select("PRAGMA index_list('{$table}')") as $existingIndex) {
                if (($existingIndex->name ?? null) === $index) {
                    return true;
                }
            }
        }

        return false;
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        if (DB::getDriverName() !== 'mysql') {
            return false;
        }

        return DB::select(
            <<<'SQL'
                SELECT CONSTRAINT_NAME
                FROM information_schema.REFERENTIAL_CONSTRAINTS
                WHERE CONSTRAINT_SCHEMA = DATABASE()
                    AND TABLE_NAME = ?
                    AND CONSTRAINT_NAME = ?
                LIMIT 1
            SQL,
            [$table, $constraint]
        ) !== [];
    }
};
