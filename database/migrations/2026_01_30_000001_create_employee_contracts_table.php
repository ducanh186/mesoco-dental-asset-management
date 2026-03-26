<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Creates employee_contracts table for contract management.
     * Admin-only feature for managing employee contracts with PDF storage.
     */
    public function up(): void
    {
        Schema::create('employee_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('department')->nullable();
            $table->string('contract_type'); // FULL_TIME, PART_TIME, INTERN, OUTSOURCE
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status')->default('ACTIVE'); // ACTIVE, EXPIRED, TERMINATED, PENDING
            $table->string('pdf_path')->nullable(); // storage path to PDF file
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Indexes for common queries
            $table->index('employee_id');
            $table->index('status');
            $table->index('start_date');
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_contracts');
    }
};
