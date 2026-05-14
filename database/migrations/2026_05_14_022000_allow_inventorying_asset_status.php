<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE assets MODIFY status ENUM('active', 'off_service', 'maintenance', 'inventorying', 'retired') NOT NULL DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE assets MODIFY status ENUM('active', 'off_service', 'maintenance', 'retired') NOT NULL DEFAULT 'active'");
        }
    }
};
