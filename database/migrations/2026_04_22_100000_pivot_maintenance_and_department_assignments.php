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
            $table->string('department_name', 150)->nullable()->after('employee_id');
            $table->index(['department_name', 'unassigned_at'], 'asset_assignments_department_active_idx');
        });

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

        Schema::table('maintenance_details', function (Blueprint $table) {
            $table->unsignedInteger('qty')->default(1)->after('asset_id');
        });

        Schema::table('maintenance_details', function (Blueprint $table) {
            $table->dropUnique('maintenance_details_maintenance_event_id_unique');
            $table->unique(
                ['maintenance_event_id', 'asset_id'],
                'maintenance_details_event_asset_unique'
            );
        });
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

        Schema::table('maintenance_details', function (Blueprint $table) {
            $table->dropUnique('maintenance_details_event_asset_unique');
            $table->dropColumn('qty');
            $table->unique('maintenance_event_id');
        });

        DB::table('asset_assignments')
            ->whereNull('employee_id')
            ->delete();

        Schema::table('asset_assignments', function (Blueprint $table) {
            $table->dropIndex('asset_assignments_department_active_idx');
            $table->dropColumn('department_name');
            $table->foreignId('employee_id')->nullable(false)->change();
        });
    }
};
