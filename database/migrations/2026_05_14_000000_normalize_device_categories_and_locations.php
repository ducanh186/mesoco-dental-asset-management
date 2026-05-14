<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $categories = [
            'PC' => 'Máy tính để bàn, laptop và workstation văn phòng.',
            'Màn hình' => 'Màn hình rời và thiết bị hiển thị.',
            'Thiết bị Test' => 'Thiết bị kiểm thử, hạ tầng lab và thiết bị kỹ thuật dùng để test.',
            'Phụ kiện dùng' => 'Phụ kiện cấp phát hoặc dùng thường xuyên.',
            'Linh kiện thay thế' => 'RAM, SSD, adapter, cáp, mainboard, bộ nguồn và linh kiện thay thế.',
        ];

        foreach ($categories as $name => $description) {
            DB::table('categories')->updateOrInsert(
                ['code' => Str::slug($name, '_')],
                [
                    'name' => $name,
                    'description' => $description,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $categoryMap = [
            'Laptop' => 'PC',
            'Desktop' => 'PC',
            'Monitor' => 'Màn hình',
            'Network' => 'Thiết bị Test',
            'Server' => 'Thiết bị Test',
            'Mobile Device' => 'Thiết bị Test',
            'Printer' => 'Phụ kiện dùng',
            'Peripheral' => 'Phụ kiện dùng',
            'Office Device' => 'Phụ kiện dùng',
            'Office IT' => 'Phụ kiện dùng',
            'Other' => 'Linh kiện thay thế',
        ];

        foreach ($categoryMap as $from => $to) {
            $categoryId = DB::table('categories')->where('name', $to)->value('id');

            DB::table('assets')
                ->where('category', $from)
                ->update([
                    'category' => $to,
                    'category_id' => $categoryId,
                    'updated_at' => $now,
                ]);
        }

        DB::table('locations')
            ->where('code', 'like', 'DEMO-LOC-%')
            ->update(['is_active' => false, 'updated_at' => $now]);
    }

    public function down(): void
    {
        DB::table('locations')
            ->where('code', 'like', 'DEMO-LOC-%')
            ->update(['is_active' => true, 'updated_at' => now()]);
    }
};
