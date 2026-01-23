<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@mesoco.vn',
            'employee_code' => 'E0001',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Doctor User',
            'email' => 'doctor@mesoco.vn',
            'employee_code' => 'E0002',
            'role' => 'doctor',
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Technician User',
            'email' => 'tech@mesoco.vn',
            'employee_code' => 'E0003',
            'role' => 'technician',
            'password' => bcrypt('password'),
        ]);
    }
}
