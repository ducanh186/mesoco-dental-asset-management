<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates asset_code_sequences table for atomic code generation.
     * Uses SELECT FOR UPDATE pattern to prevent race conditions.
     */
    public function up(): void
    {
        Schema::create('asset_code_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('prefix', 20);      // e.g., 'EQUIP', 'TOOL'
            $table->string('year_month', 6);   // e.g., '202601'
            $table->unsignedInteger('last_number')->default(0);
            $table->timestamps();
            
            // Each prefix + year_month combination is unique
            $table->unique(['prefix', 'year_month'], 'asset_code_seq_prefix_ym_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_code_sequences');
    }
};
