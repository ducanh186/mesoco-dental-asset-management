<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE shifts MODIFY code VARCHAR(50) NOT NULL');

            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE shifts ALTER COLUMN code TYPE VARCHAR(50)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE shifts MODIFY code VARCHAR(10) NOT NULL');

            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE shifts ALTER COLUMN code TYPE VARCHAR(10)');
        }
    }
};
