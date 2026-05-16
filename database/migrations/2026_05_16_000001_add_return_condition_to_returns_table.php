<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('returns', function (Blueprint $table) {
            if (!Schema::hasColumn('returns', 'return_condition')) {
                $table->string('return_condition', 255)->nullable()->after('reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('returns', function (Blueprint $table) {
            if (Schema::hasColumn('returns', 'return_condition')) {
                $table->dropColumn('return_condition');
            }
        });
    }
};
