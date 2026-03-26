<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 7: Create maintenance_events table.
 * 
 * Event-based design: each maintenance is an event with state transitions.
 * State machine: scheduled -> in_progress -> completed (or -> canceled)
 * 
 * When status = in_progress, the linked asset MUST be locked (off_service/maintenance).
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('maintenance_events', function (Blueprint $table) {
            $table->id();
            
            // Unique code: MNT-YYYYMM-0001
            $table->string('code', 20)->unique();
            
            // Link to asset being maintained
            $table->foreignId('asset_id')
                ->constrained('assets')
                ->cascadeOnDelete();
            
            // Type of maintenance
            // inspection, sterilization, filter_change, calibration, repair, other
            $table->string('type', 50);
            
            // State machine status
            // scheduled -> in_progress -> completed
            // scheduled -> canceled
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'canceled'])
                ->default('scheduled');
            
            // Planned date/time for the maintenance
            $table->timestamp('planned_at');
            
            // Priority: low, normal, high, urgent
            $table->string('priority', 20)->default('normal');
            
            // Actual start time (set when status -> in_progress)
            $table->timestamp('started_at')->nullable();
            
            // Actual completion time (set when status -> completed)
            $table->timestamp('completed_at')->nullable();
            
            // Notes/description
            $table->text('note')->nullable();
            
            // Result note after completion
            $table->text('result_note')->nullable();
            
            // Estimated duration in minutes
            $table->unsignedInteger('estimated_duration_minutes')->nullable();
            
            // Actual duration in minutes (calculated on completion)
            $table->unsignedInteger('actual_duration_minutes')->nullable();
            
            // Cost of maintenance (for tracking)
            $table->decimal('cost', 12, 2)->nullable();
            
            // Vendor/technician assignment
            $table->string('assigned_to', 100)->nullable();
            
            // Audit fields
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index(['asset_id', 'status']);
            $table->index(['status', 'planned_at']);
            $table->index(['planned_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_events');
    }
};
