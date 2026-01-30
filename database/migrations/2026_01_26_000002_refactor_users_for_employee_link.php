<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Refactors users table:
     * - Adds employee_id FK linking to employees table
     * - Adds must_change_password flag for newly created accounts
     * - Keeps role as enum/string (admin, hr, doctor, technician, employee)
     * - Removes redundant fields that now live in employees table
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add employee_id FK (nullable for migration, but required for new users)
            $table->foreignId('employee_id')
                ->nullable()
                ->after('id')
                ->constrained('employees')
                ->onDelete('cascade');
            
            // Add must_change_password flag
            $table->boolean('must_change_password')
                ->default(false)
                ->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn(['employee_id', 'must_change_password']);
        });
    }
};
