<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'serial_number')) {
                $table->string('serial_number', 100)->nullable()->after('asset_code');
            }

            if (!Schema::hasColumn('assets', 'model')) {
                $table->string('model', 150)->nullable()->after('name');
            }

            if (!Schema::hasColumn('assets', 'configuration')) {
                $table->text('configuration')->nullable()->after('model');
            }

            if (!Schema::hasColumn('assets', 'qr_code')) {
                $table->string('qr_code', 255)->nullable()->after('qr_value');
            }

            if (!Schema::hasColumn('assets', 'purchase_price')) {
                $table->decimal('purchase_price', 15, 2)->nullable()->after('purchase_cost');
            }

            if (!Schema::hasColumn('assets', 'current_depreciation_rate')) {
                $table->decimal('current_depreciation_rate', 8, 4)->nullable()->after('depreciation_rate');
            }
        });

        DB::table('assets')->update([
            'serial_number' => DB::raw('COALESCE(serial_number, asset_code)'),
            'qr_code' => DB::raw('COALESCE(qr_code, qr_value)'),
            'purchase_price' => DB::raw('COALESCE(purchase_price, purchase_cost)'),
            'current_depreciation_rate' => DB::raw('COALESCE(current_depreciation_rate, depreciation_rate)'),
        ]);

        Schema::table('assets', function (Blueprint $table) {
            if (!$this->indexExists('assets', 'assets_serial_number_unique')) {
                $table->unique('serial_number');
            }

            if (!$this->indexExists('assets', 'assets_qr_code_index')) {
                $table->index('qr_code');
            }
        });
    }

    public function down(): void
    {
        if ($this->indexExists('assets', 'assets_serial_number_unique')) {
            Schema::table('assets', function (Blueprint $table) {
                $table->dropUnique('assets_serial_number_unique');
            });
        }

        if ($this->indexExists('assets', 'assets_qr_code_index')) {
            Schema::table('assets', function (Blueprint $table) {
                $table->dropIndex('assets_qr_code_index');
            });
        }

        Schema::table('assets', function (Blueprint $table) {
            $columns = [];

            foreach (['serial_number', 'model', 'configuration', 'qr_code', 'purchase_price', 'current_depreciation_rate'] as $column) {
                if (Schema::hasColumn('assets', $column)) {
                    $columns[] = $column;
                }
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        if (DB::getDriverName() === 'sqlite') {
            foreach (DB::select("PRAGMA index_list('{$table}')") as $existingIndex) {
                if (($existingIndex->name ?? null) === $index) {
                    return true;
                }
            }

            return false;
        }

        if (DB::getDriverName() === 'mysql') {
            return DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index]) !== [];
        }

        return false;
    }
};