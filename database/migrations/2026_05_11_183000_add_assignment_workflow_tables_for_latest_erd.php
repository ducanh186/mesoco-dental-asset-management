<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('assign_date')->useCurrent();
            $table->string('note', 255)->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('assign_date');
        });

        Schema::create('assignment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['assignment_id', 'asset_id'], 'assignment_details_assignment_asset_unique');
            $table->index('asset_id');
        });

        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('return_date')->useCurrent();
            $table->string('reason', 255)->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('assignment_id');
            $table->index('return_date');
        });

        $this->backfillAssignments();
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
        Schema::dropIfExists('assignment_details');
        Schema::dropIfExists('assignments');
    }

    private function backfillAssignments(): void
    {
        foreach (DB::table('asset_assignments')->orderBy('id')->get() as $legacyAssignment) {
            $staffId = null;

            if ($legacyAssignment->employee_id) {
                $staffId = DB::table('users')
                    ->where('employee_id', $legacyAssignment->employee_id)
                    ->value('id');
            }

            $assignmentId = DB::table('assignments')->insertGetId([
                'staff_id' => $staffId,
                'admin_id' => $legacyAssignment->assigned_by,
                'assign_date' => $legacyAssignment->assigned_at,
                'note' => $legacyAssignment->department_name,
                'approved_by' => $legacyAssignment->assigned_by,
                'created_at' => $legacyAssignment->created_at ?? now(),
                'updated_at' => $legacyAssignment->updated_at ?? now(),
            ]);

            DB::table('assignment_details')->insert([
                'assignment_id' => $assignmentId,
                'asset_id' => $legacyAssignment->asset_id,
                'created_at' => $legacyAssignment->created_at ?? now(),
                'updated_at' => $legacyAssignment->updated_at ?? now(),
            ]);

            if ($legacyAssignment->unassigned_at) {
                DB::table('returns')->insert([
                    'assignment_id' => $assignmentId,
                    'staff_id' => $staffId,
                    'admin_id' => $legacyAssignment->assigned_by,
                    'return_date' => $legacyAssignment->unassigned_at,
                    'reason' => 'Migrated from legacy asset assignment history.',
                    'approved_by' => $legacyAssignment->assigned_by,
                    'created_at' => $legacyAssignment->updated_at ?? now(),
                    'updated_at' => $legacyAssignment->updated_at ?? now(),
                ]);
            }
        }
    }
};