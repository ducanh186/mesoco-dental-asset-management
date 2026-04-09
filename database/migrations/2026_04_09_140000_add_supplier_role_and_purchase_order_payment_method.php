<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('supplier_id')
                ->nullable()
                ->unique()
                ->after('employee_id')
                ->constrained('suppliers')
                ->nullOnDelete();
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('payment_method', 100)
                ->nullable()
                ->after('total_amount');
        });

        DB::table('roles')->updateOrInsert(
            ['code' => 'supplier'],
            [
                'name' => 'Supplier',
                'description' => 'Supplier portal access for purchase order fulfillment.',
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('purchase_orders')
            ->where('status', 'draft')
            ->update(['status' => 'preparing']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->where('code', 'supplier')->delete();

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
        });
    }
};
