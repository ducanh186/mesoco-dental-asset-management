<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_items', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('request_id')
                ->constrained('requests')
                ->onDelete('cascade');
            
            // Item kind: ASSET | CONSUMABLE
            $table->string('item_kind', 20);
            
            // For ASSET items (borrow equipment or justification)
            $table->foreignId('asset_id')
                ->nullable()
                ->constrained('assets')
                ->nullOnDelete();
            
            // For CONSUMABLE items
            $table->string('sku', 50)->nullable();
            $table->string('name', 255)->nullable();
            
            // Quantity and unit
            $table->decimal('qty', 10, 2)->nullable();
            $table->string('unit', 30)->nullable();
            
            // For ASSET_LOAN: shift range
            $table->foreignId('from_shift_id')
                ->nullable()
                ->constrained('shifts')
                ->nullOnDelete();
            
            $table->foreignId('to_shift_id')
                ->nullable()
                ->constrained('shifts')
                ->nullOnDelete();
            
            // Optional dates for longer loans
            $table->date('from_date')->nullable();
            $table->date('to_date')->nullable();
            
            // Item-level notes
            $table->text('note')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('request_id');
            $table->index('item_kind');
            $table->index('asset_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_items');
    }
};
