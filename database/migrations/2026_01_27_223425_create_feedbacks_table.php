<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Feedback table for Phase 8: user feedback/suggestions/issues
     * - Can be about a specific asset or maintenance event
     * - Status workflow: new -> in_progress -> resolved
     */
    public function up(): void
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            
            // Code like FB-YYMMDD-XXXX
            $table->string('code', 20)->unique();
            
            // Who created this feedback
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Optional: related asset
            $table->foreignId('asset_id')->nullable()->constrained()->nullOnDelete();
            
            // Optional: related maintenance event
            $table->foreignId('maintenance_event_id')->nullable()->constrained()->nullOnDelete();
            
            // Feedback content
            $table->text('content');
            
            // Optional rating (1-5)
            $table->unsignedTinyInteger('rating')->nullable();
            
            // Status workflow
            $table->enum('status', ['new', 'in_progress', 'resolved'])->default('new');
            
            // Type of feedback
            $table->enum('type', ['issue', 'suggestion', 'praise', 'other'])->default('other');
            
            // Admin/technician response/note
            $table->text('response')->nullable();
            
            // Who resolved it
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for common queries
            $table->index('status');
            $table->index('type');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
