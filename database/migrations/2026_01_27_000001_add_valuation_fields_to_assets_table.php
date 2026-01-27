<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Phase 6: Add valuation and depreciation fields to assets table.
     * Supports time-based straight-line depreciation calculation.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Valuation fields
            $table->date('purchase_date')->nullable()->after('instructions_url');
            $table->decimal('purchase_cost', 12, 2)->nullable()->after('purchase_date');
            $table->unsignedInteger('useful_life_months')->nullable()->after('purchase_cost');
            $table->decimal('salvage_value', 12, 2)->default(0)->after('useful_life_months');
            $table->enum('depreciation_method', ['TIME', 'USAGE'])->default('TIME')->after('salvage_value');
            
            // Category and location for inventory management
            $table->string('category', 100)->nullable()->after('type');
            $table->string('location', 100)->nullable()->after('category');
            
            // Warranty tracking
            $table->date('warranty_expiry')->nullable()->after('location');
            
            // Indexes for common queries
            $table->index('purchase_date');
            $table->index('category');
            $table->index('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex(['purchase_date']);
            $table->dropIndex(['category']);
            $table->dropIndex(['location']);
            
            $table->dropColumn([
                'purchase_date',
                'purchase_cost',
                'useful_life_months',
                'salvage_value',
                'depreciation_method',
                'category',
                'location',
                'warranty_expiry',
            ]);
        });
    }
};
