<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Asset check-ins table for shift-based tracking.
     * One active check-in per asset per shift_date+shift_id.
     */
    public function up(): void
    {
        Schema::create('asset_checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->cascadeOnDelete();
            $table->date('shift_date');
            $table->timestamp('checked_in_at');
            $table->timestamp('checked_out_at')->nullable();
            $table->enum('source', ['qr', 'manual'])->default('manual');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint: one check-in per asset per shift per day
            $table->unique(['asset_id', 'shift_id', 'shift_date'], 'unique_asset_shift_date');
            
            // Indexes for common queries
            $table->index(['employee_id', 'shift_date']);
            $table->index(['shift_date', 'shift_id']);
            $table->index('checked_in_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_checkins');
    }
};
