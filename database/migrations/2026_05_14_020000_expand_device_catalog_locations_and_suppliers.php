<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->normalizeReplacementPartCategories();
    }

    public function down(): void
    {
        // Data normalization is intentionally not reversed.
    }

    private function normalizeReplacementPartCategories(): void
    {
        if (!Schema::hasTable('assets')) {
            return;
        }

        $rules = [
            'RAM' => 'RAM',
            'SSD' => 'SSD',
            'HDD' => 'HDD',
            'Tai nghe' => 'Tai nghe',
            'Adapter' => 'Adapter',
            'Cáp' => 'Cáp kết nối',
            'Mainboard' => 'Mainboard',
            'Bộ nguồn' => 'Bộ nguồn',
        ];

        foreach ($rules as $namePart => $category) {
            DB::table('assets')
                ->where('name', 'like', "%{$namePart}%")
                ->update(['category' => $category, 'updated_at' => now()]);
        }
    }
};
