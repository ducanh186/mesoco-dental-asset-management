<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 7: Add off-service metadata fields to assets table.
 * 
 * These fields capture WHO locked the asset, WHY, and for WHEN.
 * Used for audit trail and scheduled unlocking.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Reason for off-service (e.g., "Scheduled maintenance", "Broken")
            $table->string('off_service_reason', 255)->nullable()->after('status');
            
            // When the off-service period starts
            $table->timestamp('off_service_from')->nullable()->after('off_service_reason');
            
            // When the off-service period ends (nullable = indefinite)
            $table->timestamp('off_service_until')->nullable()->after('off_service_from');
            
            // Who set the off-service status
            $table->foreignId('off_service_set_by')
                ->nullable()
                ->after('off_service_until')
                ->constrained('users')
                ->nullOnDelete();
            
            // Index for queries filtering by off-service metadata
            $table->index(['status', 'off_service_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['off_service_set_by']);
            $table->dropIndex(['status', 'off_service_from']);
            $table->dropColumn([
                'off_service_reason',
                'off_service_from',
                'off_service_until',
                'off_service_set_by',
            ]);
        });
    }
};
