<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            
            // Unique code: REQ-YYYYMM-0001
            $table->string('code', 20)->unique();
            
            // Type: JUSTIFICATION | ASSET_LOAN | CONSUMABLE_REQUEST
            $table->string('type', 30);
            
            // Status: SUBMITTED | APPROVED | REJECTED | CANCELLED
            $table->string('status', 20)->default('SUBMITTED');
            
            // Requester (employee who created this request)
            $table->foreignId('requested_by_employee_id')
                ->constrained('employees')
                ->onDelete('cascade');
            
            // Reviewer (nullable until reviewed)
            $table->foreignId('reviewed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            
            // Request details
            $table->string('title', 255);
            $table->text('description')->nullable();
            
            // Priority/Severity (especially for JUSTIFICATION)
            // Values: low, medium, high, critical
            $table->string('severity', 20)->nullable();
            
            // For JUSTIFICATION: incident details
            $table->timestamp('incident_at')->nullable();
            $table->string('suspected_cause', 50)->nullable(); // wear, operation, unknown
            
            $table->timestamps();
            
            // Indexes for common queries
            $table->index(['type', 'status']);
            $table->index(['requested_by_employee_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
