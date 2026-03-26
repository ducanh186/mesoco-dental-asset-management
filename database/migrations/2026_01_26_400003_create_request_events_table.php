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
        Schema::create('request_events', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('request_id')
                ->constrained('requests')
                ->onDelete('cascade');
            
            // Actor who performed the action
            $table->foreignId('actor_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            
            // Event type: CREATED, SUBMITTED, APPROVED, REJECTED, CANCELLED
            $table->string('event_type', 30);
            
            // Optional metadata (JSON)
            $table->json('meta')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes
            $table->index(['request_id', 'created_at']);
            $table->index('event_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_events');
    }
};
