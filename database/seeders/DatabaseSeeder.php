<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\AssetQrIdentity;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * 
     * Creates test employees and user accounts for each role.
     * Uses updateOrCreate for idempotent seeding (can run multiple times).
     */
    public function run(): void
    {
        // ========================================
        // Phase 4: Seed Shifts (must be before any check-in data)
        // ========================================
        $this->call(ShiftSeeder::class);

        // ========================================
        // Manager User (role: manager)
        // ========================================
        $adminEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0001'],
            [
                'full_name' => 'Nguyễn Văn An',
                'email' => 'manager@mesoco.vn',
                'position' => 'Quản trị hệ thống',
                'dob' => '1985-01-15',
                'gender' => 'male',
                'phone' => '0901234567',
                'address' => '123 Admin Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $adminEmployee->id],
            [
                'employee_code' => $adminEmployee->employee_code,
                'name' => $adminEmployee->full_name,
                'email' => $adminEmployee->email,
                'role' => 'manager',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // Technician User (role: technician)
        // ========================================
        $hrEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0002'],
            [
                'full_name' => 'Trần Thị Bình',
                'email' => 'technician@mesoco.vn',
                'position' => 'Trưởng phòng Nhân sự',
                'dob' => '1988-05-20',
                'gender' => 'female',
                'phone' => '0901234568',
                'address' => '456 Service Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $hrEmployee->id],
            [
                'employee_code' => $hrEmployee->employee_code,
                'name' => $hrEmployee->full_name,
                'email' => $hrEmployee->email,
                'role' => 'technician',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // Doctor User (role: doctor)
        // ========================================
        $doctorEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0003'],
            [
                'full_name' => 'Lê Minh Cường',
                'email' => 'doctor@mesoco.vn',
                'position' => 'Bác sĩ Nha khoa',
                'dob' => '1982-08-10',
                'gender' => 'male',
                'phone' => '0901234569',
                'address' => '789 Medical Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $doctorEmployee->id],
            [
                'employee_code' => $doctorEmployee->employee_code,
                'name' => $doctorEmployee->full_name,
                'email' => $doctorEmployee->email,
                'role' => 'doctor',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // Technician User (role: technician)
        // ========================================
        $techEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0004'],
            [
                'full_name' => 'Phạm Văn Dũng',
                'email' => 'tech@mesoco.vn',
                'position' => 'Kỹ thuật viên Nha khoa',
                'dob' => '1990-03-25',
                'gender' => 'male',
                'phone' => '0901234570',
                'address' => '101 Tech Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $techEmployee->id],
            [
                'employee_code' => $techEmployee->employee_code,
                'name' => $techEmployee->full_name,
                'email' => $techEmployee->email,
                'role' => 'technician',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // Regular Employee (role: employee)
        // ========================================
        $regularEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0005'],
            [
                'full_name' => 'Hoàng Thị Mai',
                'email' => 'employee@mesoco.vn',
                'position' => 'Lễ tân',
                'dob' => '1995-12-01',
                'gender' => 'female',
                'phone' => '0901234571',
                'address' => '202 Employee Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $regularEmployee->id],
            [
                'employee_code' => $regularEmployee->employee_code,
                'name' => $regularEmployee->full_name,
                'email' => $regularEmployee->email,
                'role' => 'employee',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // Employees without user accounts (for testing Add User popup)
        // ========================================
        Employee::updateOrCreate(
            ['employee_code' => 'E0006'],
            [
                'full_name' => 'Pending User One',
                'email' => 'pending1@mesoco.vn',
                'position' => 'Dental Assistant',
                'dob' => '1993-07-18',
                'gender' => 'female',
                'phone' => '0901234572',
                'address' => '303 Pending Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['employee_code' => 'E0007'],
            [
                'full_name' => 'Pending User Two',
                'email' => 'pending2@mesoco.vn',
                'position' => 'Lab Technician',
                'dob' => '1991-11-30',
                'gender' => 'male',
                'phone' => '0901234573',
                'address' => '404 Pending Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        // ========================================
        // PHASE 3: Test Assets
        // ========================================
        
        // Tray assets with valuation data
        $tray1 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-001'],
            [
                'name' => 'Basic Examination Tray',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'Standard examination instruments set',
                'instructions_url' => 'https://docs.mesoco.example/trays/basic-examination-tray',
                'purchase_date' => '2024-02-15',
                'purchase_cost' => 3500000.00, // 3.5M VND
                'useful_life_months' => 24, // 2 years
                'salvage_value' => 350000.00, // 350K VND
                'warranty_expiry' => '2026-02-15', // Valid warranty
            ]
        );

        $tray2 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-002'],
            [
                'name' => 'Surgical Tray Set A',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'For minor surgical procedures',
                'purchase_date' => '2023-09-10',
                'purchase_cost' => 6800000.00, // 6.8M VND
                'useful_life_months' => 36, // 3 years
                'salvage_value' => 680000.00, // 680K VND
                'warranty_expiry' => '2025-12-31', // Expired warranty
            ]
        );

        $tray3 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-003'],
            [
                'name' => 'Orthodontic Tray',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'Orthodontic adjustment instruments',
                'purchase_date' => '2024-05-20',
                'purchase_cost' => 4200000.00, // 4.2M VND
                'useful_life_months' => 30, // 2.5 years
                'salvage_value' => 420000.00, // 420K VND
                'warranty_expiry' => '2026-05-20', // Valid warranty
            ]
        );

        // Machine assets with valuation data
        $machine1 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-001'],
            [
                'name' => 'Dental X-Ray Unit',
                'type' => 'machine',
                'status' => 'active',
                'notes' => 'Digital X-ray machine, Room 101',
                'instructions_url' => 'https://docs.mesoco.example/machines/dental-xray-unit',
                'purchase_date' => '2023-01-15',
                'purchase_cost' => 85000000.00, // 85M VND
                'useful_life_months' => 120, // 10 years
                'salvage_value' => 8500000.00, // 8.5M VND
                'warranty_expiry' => '2026-01-15', // Valid warranty
            ]
        );

        $machine2 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-002'],
            [
                'name' => 'Ultrasonic Scaler',
                'type' => 'machine',
                'status' => 'active',
                'notes' => 'Piezoelectric scaler unit',
                'purchase_date' => '2024-06-01',
                'purchase_cost' => 12000000.00, // 12M VND
                'useful_life_months' => 60, // 5 years
                'salvage_value' => 1200000.00, // 1.2M VND
                'warranty_expiry' => '2026-03-15', // Expiring soon (within 3 months)
            ]
        );

        $machine3 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-003'],
            [
                'name' => 'Autoclave Sterilizer',
                'type' => 'machine',
                'status' => 'maintenance',
                'notes' => 'Under scheduled maintenance',
                'purchase_date' => '2022-03-10',
                'purchase_cost' => 25000000.00, // 25M VND
                'useful_life_months' => 84, // 7 years
                'salvage_value' => 2500000.00, // 2.5M VND
                'warranty_expiry' => '2025-03-10', // Expired warranty
            ]
        );

        // Equipment assets with valuation data
        $equip1 = Asset::updateOrCreate(
            ['asset_code' => 'EQUIP-001'],
            [
                'name' => 'Dental Chair Unit #1',
                'type' => 'equipment',
                'status' => 'active',
                'notes' => 'Main treatment room chair',
                'purchase_date' => '2023-08-20',
                'purchase_cost' => 45000000.00, // 45M VND
                'useful_life_months' => 180, // 15 years
                'salvage_value' => 4500000.00, // 4.5M VND
                'warranty_expiry' => '2028-08-20', // Valid warranty (long term)
            ]
        );

        $equip2 = Asset::updateOrCreate(
            ['asset_code' => 'EQUIP-002'],
            [
                'name' => 'Light Curing Unit',
                'type' => 'equipment',
                'status' => 'active',
                'notes' => 'LED curing light',
                'purchase_date' => '2024-11-01',
                'purchase_cost' => 8500000.00, // 8.5M VND
                'useful_life_months' => 36, // 3 years
                'salvage_value' => 850000.00, // 850K VND
                'warranty_expiry' => '2026-02-01', // Expiring soon (within 1 month)
            ]
        );

        // Off-service asset for testing
        Asset::updateOrCreate(
            ['asset_code' => 'EQUIP-003'],
            [
                'name' => 'Old Compressor',
                'type' => 'equipment',
                'status' => 'off_service',
                'notes' => 'Decommissioned - awaiting disposal',
            ]
        );

        // Create QR identities for assets
        $assetsForQr = [$tray1, $tray2, $tray3, $machine1, $machine2, $machine3, $equip1, $equip2];
        foreach ($assetsForQr as $asset) {
            // Only create if not exists (firstOrCreate to handle idempotent seeding)
            if (!$asset->qrIdentity) {
                AssetQrIdentity::create([
                    'qr_uid' => (string) \Illuminate\Support\Str::uuid(),
                    'asset_id' => $asset->id,
                    'payload_version' => 'v1',
                ]);
            }
        }

        // Create some assignments for testing
        // Assign TRAY-001 to Doctor (E0003)
        $adminUser = User::where('employee_code', 'E0001')->first();
        
        AssetAssignment::updateOrCreate(
            ['asset_id' => $tray1->id, 'unassigned_at' => null],
            [
                'employee_id' => $doctorEmployee->id,
                'assigned_by' => $adminUser->id,
                'assigned_at' => now()->subDays(30),
            ]
        );

        // Assign MACH-002 to Technician (E0004)
        AssetAssignment::updateOrCreate(
            ['asset_id' => $machine2->id, 'unassigned_at' => null],
            [
                'employee_id' => $techEmployee->id,
                'assigned_by' => $adminUser->id,
                'assigned_at' => now()->subDays(15),
            ]
        );

        // Assign EQUIP-002 to Doctor (E0003) - doctor has 2 assets
        AssetAssignment::updateOrCreate(
            ['asset_id' => $equip2->id, 'unassigned_at' => null],
            [
                'employee_id' => $doctorEmployee->id,
                'assigned_by' => $adminUser->id,
                'assigned_at' => now()->subDays(7),
            ]
        );

        // ========================================
        // Asset History Events - Create some check-in/check-out events
        // ========================================
        
        // Get shifts for check-in data
        $morningShift = \App\Models\Shift::where('name', 'Morning Shift')->first();
        $eveningShift = \App\Models\Shift::where('name', 'Evening Shift')->first();
        
        // Doctor's check-ins with TRAY-001 (multiple events over time)
        $doctorUser = User::where('employee_code', 'E0003')->first();
        $techUser = User::where('employee_code', 'E0004')->first();
        
        // Historical check-in/check-out events
        \App\Models\AssetCheckin::updateOrCreate(
            [
                'asset_id' => $tray1->id,
                'employee_id' => $doctorUser->id,
                'shift_date' => now()->subDays(10)->format('Y-m-d'),
                'shift_id' => $morningShift->id,
            ],
            [
                'checked_in_at' => now()->subDays(10)->setHour(8)->setMinute(30),
                'checked_out_at' => now()->subDays(10)->setHour(17)->setMinute(45),
                'source' => 'manual',
                'notes' => 'Used for routine examinations',
            ]
        );
        
        \App\Models\AssetCheckin::updateOrCreate(
            [
                'asset_id' => $tray1->id,
                'employee_id' => $doctorUser->id,
                'shift_date' => now()->subDays(8)->format('Y-m-d'),
                'shift_id' => $eveningShift->id,
            ],
            [
                'checked_in_at' => now()->subDays(8)->setHour(14)->setMinute(15),
                'checked_out_at' => now()->subDays(8)->setHour(21)->setMinute(30),
                'source' => 'qr',
                'notes' => 'Evening shift procedures',
            ]
        );
        
        // Technician's check-ins with MACH-002 (Ultrasonic Scaler)
        \App\Models\AssetCheckin::updateOrCreate(
            [
                'asset_id' => $machine2->id,
                'employee_id' => $techUser->id,
                'shift_date' => now()->subDays(5)->format('Y-m-d'),
                'shift_id' => $morningShift->id,
            ],
            [
                'checked_in_at' => now()->subDays(5)->setHour(9)->setMinute(0),
                'checked_out_at' => now()->subDays(5)->setHour(16)->setMinute(30),
                'source' => 'qr',
                'notes' => 'Deep cleaning procedures',
            ]
        );
        
        \App\Models\AssetCheckin::updateOrCreate(
            [
                'asset_id' => $machine2->id,
                'employee_id' => $techUser->id,
                'shift_date' => now()->subDays(3)->format('Y-m-d'),
                'shift_id' => $morningShift->id,
            ],
            [
                'checked_in_at' => now()->subDays(3)->setHour(8)->setMinute(45),
                'checked_out_at' => now()->subDays(3)->setHour(15)->setMinute(20),
                'source' => 'manual',
                'notes' => 'Maintenance and calibration',
            ]
        );
        
        // Doctor's recent check-in with EQUIP-002 (Light Curing Unit) - still checked in
        \App\Models\AssetCheckin::updateOrCreate(
            [
                'asset_id' => $equip2->id,
                'employee_id' => $doctorUser->id,
                'shift_date' => now()->format('Y-m-d'),
                'shift_id' => $morningShift->id,
            ],
            [
                'checked_in_at' => now()->setHour(8)->setMinute(0),
                'checked_out_at' => null, // Still checked in
                'source' => 'qr',
                'notes' => 'Current day usage',
            ]
        );

        // ========================================
        // Historical Assignment Changes (for assignment history)
        // ========================================
        
        // Show an asset that was reassigned from one employee to another
        $staffEmployee = Employee::where('employee_code', 'E0005')->first();
        
        // Create a historical assignment (unassigned)
        AssetAssignment::create([
            'asset_id' => $equip2->id,
            'employee_id' => $staffEmployee->id,
            'assigned_by' => $adminUser->id,
            'assigned_at' => now()->subDays(30),
            'unassigned_at' => now()->subDays(7), // Unassigned 7 days ago
        ]);
    }
}
