<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds instructions_url field to assets for linking to PDF/wiki/drive instructions.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->text('instructions_url')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('instructions_url');
        });
    }
};
