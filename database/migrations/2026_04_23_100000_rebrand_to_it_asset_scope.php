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
            'Laptop' => 'Portable computers assigned or handed over to departments.',
            'Desktop' => 'Desktop workstations and all-in-one computers.',
            'Monitor' => 'Displays, projectors, and visual output equipment.',
            'Network' => 'Routers, switches, access points, and network appliances.',
            'Server' => 'Servers, NAS devices, and shared infrastructure hardware.',
            'Peripheral' => 'Keyboards, mice, docking stations, headsets, and accessories.',
            'Printer' => 'Printers, scanners, and document devices.',
            'Mobile Device' => 'Phones, tablets, and mobile test devices.',
            'Office IT' => 'UPS, meeting-room devices, and shared office IT equipment.',
            'Other' => 'Assets that do not fit a standard IT category.',
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
            'Imaging' => 'Monitor',
            'Sterilization' => 'Office IT',
            'Treatment' => 'Desktop',
            'Cleaning' => 'Peripheral',
            'Furniture' => 'Office IT',
            'Infrastructure' => 'Network',
            'Handpieces' => 'Peripheral',
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

        DB::table('maintenance_events')
            ->where('type', 'sterilization')
            ->update(['type' => 'cleaning', 'updated_at' => $now]);

        DB::table('maintenance_events')
            ->where('type', 'filter_change')
            ->update(['type' => 'hardware_upgrade', 'updated_at' => $now]);

        DB::table('roles')
            ->where('code', 'doctor')
            ->update([
                'is_active' => false,
                'updated_at' => $now,
            ]);

        $employeeRoleId = DB::table('roles')->where('code', 'employee')->value('id');
        if ($employeeRoleId) {
            DB::table('users')
                ->where('role', 'doctor')
                ->update([
                    'role' => 'employee',
                    'role_id' => $employeeRoleId,
                    'updated_at' => $now,
                ]);
        }
    }

    public function down(): void
    {
        DB::table('maintenance_events')
            ->where('type', 'hardware_upgrade')
            ->update(['type' => 'filter_change', 'updated_at' => now()]);
    }
};
