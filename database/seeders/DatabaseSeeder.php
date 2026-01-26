<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetQrIdentity;
use App\Models\Employee;
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
        // Admin User (role: admin)
        // ========================================
        $adminEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0001'],
            [
                'full_name' => 'Nguyễn Văn An',
                'email' => 'admin@mesoco.vn',
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
                'role' => 'admin',
                'password' => Hash::make('password'),
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // ========================================
        // HR User (role: hr)
        // ========================================
        $hrEmployee = Employee::updateOrCreate(
            ['employee_code' => 'E0002'],
            [
                'full_name' => 'Trần Thị Bình',
                'email' => 'hr@mesoco.vn',
                'position' => 'Trưởng phòng Nhân sự',
                'dob' => '1988-05-20',
                'gender' => 'female',
                'phone' => '0901234568',
                'address' => '456 HR Street, Ho Chi Minh City',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['employee_id' => $hrEmployee->id],
            [
                'employee_code' => $hrEmployee->employee_code,
                'name' => $hrEmployee->full_name,
                'email' => $hrEmployee->email,
                'role' => 'hr',
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
        
        // Tray assets
        $tray1 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-001'],
            [
                'name' => 'Basic Examination Tray',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'Standard examination instruments set',
                'instructions_url' => 'https://docs.mesoco.example/trays/basic-examination-tray',
            ]
        );

        $tray2 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-002'],
            [
                'name' => 'Surgical Tray Set A',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'For minor surgical procedures',
            ]
        );

        $tray3 = Asset::updateOrCreate(
            ['asset_code' => 'TRAY-003'],
            [
                'name' => 'Orthodontic Tray',
                'type' => 'tray',
                'status' => 'active',
                'notes' => 'Orthodontic adjustment instruments',
            ]
        );

        // Machine assets
        $machine1 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-001'],
            [
                'name' => 'Dental X-Ray Unit',
                'type' => 'machine',
                'status' => 'active',
                'notes' => 'Digital X-ray machine, Room 101',
                'instructions_url' => 'https://docs.mesoco.example/machines/dental-xray-unit',
            ]
        );

        $machine2 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-002'],
            [
                'name' => 'Ultrasonic Scaler',
                'type' => 'machine',
                'status' => 'active',
                'notes' => 'Piezoelectric scaler unit',
            ]
        );

        $machine3 = Asset::updateOrCreate(
            ['asset_code' => 'MACH-003'],
            [
                'name' => 'Autoclave Sterilizer',
                'type' => 'machine',
                'status' => 'maintenance',
                'notes' => 'Under scheduled maintenance',
            ]
        );

        // Equipment assets
        $equip1 = Asset::updateOrCreate(
            ['asset_code' => 'EQUIP-001'],
            [
                'name' => 'Dental Chair Unit #1',
                'type' => 'equipment',
                'status' => 'active',
                'notes' => 'Main treatment room chair',
            ]
        );

        $equip2 = Asset::updateOrCreate(
            ['asset_code' => 'EQUIP-002'],
            [
                'name' => 'Light Curing Unit',
                'type' => 'equipment',
                'status' => 'active',
                'notes' => 'LED curing light',
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
    }
}
