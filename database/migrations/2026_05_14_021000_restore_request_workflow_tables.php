<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('requests')) {
            Schema::create('requests', function (Blueprint $table) {
                $table->id();
                $table->string('code', 20)->unique();
                $table->string('type', 30);
                $table->string('status', 20)->default('SUBMITTED');
                $table->foreignId('requested_by_employee_id')->constrained('employees')->cascadeOnDelete();
                $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->text('review_note')->nullable();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->string('severity', 20)->nullable();
                $table->timestamp('incident_at')->nullable();
                $table->string('suspected_cause', 50)->nullable();
                $table->timestamps();

                $table->index(['type', 'status']);
                $table->index(['requested_by_employee_id', 'created_at']);
                $table->index(['status', 'created_at']);
            });
        }

        if (!Schema::hasTable('request_items')) {
            Schema::create('request_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->string('item_kind', 20);
                $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->string('sku', 50)->nullable();
                $table->string('name', 255)->nullable();
                $table->decimal('qty', 10, 2)->nullable();
                $table->string('unit', 30)->nullable();
                $table->foreignId('from_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
                $table->foreignId('to_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
                $table->date('from_date')->nullable();
                $table->date('to_date')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->index('request_id');
                $table->index('item_kind');
                $table->index('asset_id');
            });
        }

        if (!Schema::hasTable('request_events')) {
            Schema::create('request_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('event_type', 30);
                $table->json('meta')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['request_id', 'created_at']);
                $table->index('event_type');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('request_events');
        Schema::dropIfExists('request_items');
        Schema::dropIfExists('requests');
    }
};
