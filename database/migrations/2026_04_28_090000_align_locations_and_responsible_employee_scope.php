<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('id');
            $table->unique('code');
        });

        foreach (DB::table('locations')->select('id')->orderBy('id')->cursor() as $location) {
            DB::table('locations')
                ->where('id', $location->id)
                ->update(['code' => sprintf('LOC-%04d', $location->id)]);
        }

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('location_id')
                ->nullable()
                ->after('category_id')
                ->constrained('locations')
                ->nullOnDelete();
            $table->index('location_id');
        });

        foreach (
            DB::table('assets')
                ->whereNotNull('location')
                ->select('id', 'location')
                ->cursor() as $asset
        ) {
            $locationId = DB::table('locations')
                ->where('name', $asset->location)
                ->value('id');

            if ($locationId) {
                DB::table('assets')
                    ->where('id', $asset->id)
                    ->update(['location_id' => $locationId]);
            }
        }

        DB::table('asset_assignments')
            ->whereNull('employee_id')
            ->whereNull('unassigned_at')
            ->update([
                'unassigned_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropIndex(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });
    }
};
