<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Creates asset_qr_identities table for QR code tracking.
     * QR payload format v1: "MESOCO|ASSET|v1|<qr_uid>"
     */
    public function up(): void
    {
        Schema::create('asset_qr_identities', function (Blueprint $table) {
            $table->id();
            $table->uuid('qr_uid')->unique();
            $table->foreignId('asset_id')
                ->constrained('assets')
                ->onDelete('cascade');
            $table->string('payload_version')->default('v1');
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
            
            // Index for QR lookup
            $table->index('qr_uid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_qr_identities');
    }
};
