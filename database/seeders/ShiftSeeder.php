<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shift;

class ShiftSeeder extends Seeder
{
    /**
     * Seed the default work shifts.
     * 
     * Default 3 shifts:
     * - S1: 08:00-12:00 (Morning)
     * - S2: 13:00-17:00 (Afternoon)
     * - S3: 18:00-21:00 (Evening - optional, can be disabled)
     */
    public function run(): void
    {
        $shifts = [
            [
                'code' => 'S1',
                'name' => 'Morning Shift',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'S2',
                'name' => 'Afternoon Shift',
                'start_time' => '13:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'S3',
                'name' => 'Evening Shift',
                'start_time' => '18:00:00',
                'end_time' => '21:00:00',
                'is_active' => true, // Can be disabled later via admin
                'sort_order' => 3,
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::updateOrCreate(
                ['code' => $shift['code']],
                $shift
            );
        }
    }
}
