<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_code', 50)->unique();
            $table->foreignId('purchase_order_id')->unique()->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('received_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('received_at')->nullable();
            $table->string('status', 30)->default('completed');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['status', 'received_at']);
        });

        Schema::create('purchase_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_receipt_id')->constrained('purchase_receipts')->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->nullable()->constrained('purchase_order_items')->nullOnDelete();
            $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->string('item_name');
            $table->decimal('ordered_qty', 12, 2)->default(0);
            $table->decimal('accepted_qty', 12, 2)->default(0);
            $table->decimal('rejected_qty', 12, 2)->default(0);
            $table->string('unit', 30)->nullable();
            $table->string('condition_status', 30)->default('accepted');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_receipt_items');
        Schema::dropIfExists('purchase_receipts');
    }
};
