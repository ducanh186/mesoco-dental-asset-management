<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Shifts table for clinic shift management.
     * Default shifts: S1 08:00-12:00, S2 13:00-17:00, S3 18:00-21:00
     */
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();           // S1, S2, S3
            $table->string('name', 100);                    // Morning, Afternoon, Evening
            $table->time('start_time');                     // 08:00:00
            $table->time('end_time');                       // 12:00:00
            $table->boolean('is_active')->default(true);    // Can disable shifts
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
