<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Creates asset_assignments table to track who has which asset.
     * Only 1 active assignment per asset (unassigned_at = null means active).
     */
    public function up(): void
    {
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')
                ->constrained('assets')
                ->onDelete('cascade');
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');
            $table->foreignId('assigned_by')
                ->constrained('users')
                ->onDelete('restrict');
            $table->timestamp('assigned_at');
            $table->timestamp('unassigned_at')->nullable();
            $table->timestamps();
            
            // Index for finding active assignment (unassigned_at IS NULL)
            $table->index(['asset_id', 'unassigned_at']);
            $table->index(['employee_id', 'unassigned_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignments');
    }
};
