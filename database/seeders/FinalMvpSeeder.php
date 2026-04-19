<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\AssetQrIdentity;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\Feedback;
use App\Models\Location;
use App\Models\MaintenanceEvent;
use App\Models\RequestEvent;
use App\Models\RequestItem;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Final MVP Seeder - Creates comprehensive demo data for the entire system.
 * 
 * This seeder is IDEMPOTENT - safe to run multiple times without duplicating data.
 * Uses updateOrCreate with deterministic identifiers (codes, emails).
 * 
 * Coverage:
 * - 10 Employees with User accounts (all roles represented)
 * - 3 Locations
 * - 3 Shifts (via ShiftSeeder)
 * - 65 Assets with valuation data (MSA-XXXX pattern)
 * - 15 Asset Assignments (active and historical)
 * - QR Identities for all assets
 * - 8 Asset Checkin records
 * 
 * Run: php artisan db:seed --class=FinalMvpSeeder
 */
class FinalMvpSeeder extends Seeder
{
    /**
     * Default password for all demo users.
     */
    private const DEFAULT_PASSWORD = 'password';

    /**
     * Cached references for cross-seeding.
     */
    private array $employees = [];
    private array $users = [];
    private array $assets = [];
    private array $shifts = [];
    private array $locations = [];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Final MVP Seeder...');
        $this->command->newLine();

        DB::transaction(function () {
            $this->seedLocations();
            $this->seedShifts();
            $this->seedEmployeesAndUsers();
            $this->seedAssets();
            $this->seedQrIdentities();
            $this->seedAssignments();
            $this->seedRequests();
            $this->seedCheckins();
            $this->seedMaintenanceEvents();
            $this->seedFeedback();
        });

        $this->call(ErdAlignmentSeeder::class);

        $this->command->newLine();
        $this->command->info('✅ Final MVP Seeder completed successfully!');
        $this->printSummary();
    }

    /**
     * Seed clinic locations.
     */
    private function seedLocations(): void
    {
        $this->command->info('📍 Seeding locations...');

        $locations = [
            [
                'name' => 'Main Clinic - District 1',
                'description' => 'Primary dental clinic with 5 treatment rooms',
                'address' => '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
                'is_active' => true,
            ],
            [
                'name' => 'Branch Clinic - District 3',
                'description' => 'Branch office with 3 treatment rooms',
                'address' => '456 Vo Van Tan Street, District 3, Ho Chi Minh City',
                'is_active' => true,
            ],
            [
                'name' => 'Storage Warehouse',
                'description' => 'Central storage for equipment and supplies',
                'address' => '789 Industrial Zone, Binh Tan District, Ho Chi Minh City',
                'is_active' => true,
            ],
        ];

        foreach ($locations as $data) {
            $location = Location::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
            $this->locations[$data['name']] = $location;
        }

        $this->command->info("   Created/updated " . count($locations) . " locations");
    }

    /**
     * Seed shifts (delegates to ShiftSeeder).
     */
    private function seedShifts(): void
    {
        $this->command->info('🕐 Seeding shifts...');

        $this->call(ShiftSeeder::class);

        // Cache shifts for later use
        $this->shifts = [
            'morning' => Shift::where('code', 'S1')->first(),
            'afternoon' => Shift::where('code', 'S2')->first(),
            'evening' => Shift::where('code', 'S3')->first(),
        ];
    }

    /**
     * Seed employees and their user accounts.
     */
    private function seedEmployeesAndUsers(): void
    {
        $this->command->info('👥 Seeding employees and users...');

        $employeeData = [
            // Manager
            [
                'employee_code' => 'E0001',
                'full_name' => 'Nguyễn Văn Quản Lý',
                'email' => 'manager@mesoco.vn',
                'position' => 'Equipment Manager',
                'dob' => '1985-03-15',
                'gender' => 'male',
                'phone' => '0901234567',
                'address' => '100 Manager Street, District 1, HCMC',
                'role' => User::ROLE_MANAGER,
            ],
            // Senior technician
            [
                'employee_code' => 'E0002',
                'full_name' => 'Trần Thị Kỹ Thuật',
                'email' => 'technician@mesoco.vn',
                'position' => 'Senior Technician',
                'dob' => '1988-07-22',
                'gender' => 'female',
                'phone' => '0901234568',
                'address' => '200 Service Avenue, District 3, HCMC',
                'role' => User::ROLE_TECHNICIAN,
            ],
            // Doctors
            [
                'employee_code' => 'E0003',
                'full_name' => 'Dr. Lê Văn Bác Sĩ',
                'email' => 'doctor1@mesoco.vn',
                'position' => 'Senior Dentist',
                'dob' => '1980-11-10',
                'gender' => 'male',
                'phone' => '0901234569',
                'address' => '301 Medical Lane, District 7, HCMC',
                'role' => User::ROLE_DOCTOR,
            ],
            [
                'employee_code' => 'E0004',
                'full_name' => 'Dr. Phạm Thị Nha Sĩ',
                'email' => 'doctor2@mesoco.vn',
                'position' => 'Orthodontist',
                'dob' => '1985-05-25',
                'gender' => 'female',
                'phone' => '0901234570',
                'address' => '302 Medical Lane, District 7, HCMC',
                'role' => User::ROLE_DOCTOR,
            ],
            // Technicians
            [
                'employee_code' => 'E0005',
                'full_name' => 'Hoàng Văn Kỹ Thuật',
                'email' => 'tech1@mesoco.vn',
                'position' => 'Dental Technician',
                'dob' => '1990-02-14',
                'gender' => 'male',
                'phone' => '0901234571',
                'address' => '401 Tech Road, Binh Thanh District, HCMC',
                'role' => User::ROLE_TECHNICIAN,
            ],
            [
                'employee_code' => 'E0006',
                'full_name' => 'Võ Thị Kỹ Thuật Viên',
                'email' => 'tech2@mesoco.vn',
                'position' => 'Lab Technician',
                'dob' => '1992-09-30',
                'gender' => 'female',
                'phone' => '0901234572',
                'address' => '402 Tech Road, Binh Thanh District, HCMC',
                'role' => User::ROLE_TECHNICIAN,
            ],
            // Staff
            [
                'employee_code' => 'E0007',
                'full_name' => 'Đặng Văn Nhân Viên',
                'email' => 'staff1@mesoco.vn',
                'position' => 'Receptionist',
                'dob' => '1995-12-05',
                'gender' => 'male',
                'phone' => '0901234573',
                'address' => '501 Staff Street, District 10, HCMC',
                'role' => User::ROLE_EMPLOYEE,
            ],
            [
                'employee_code' => 'E0008',
                'full_name' => 'Bùi Thị Lễ Tân',
                'email' => 'staff2@mesoco.vn',
                'position' => 'Dental Assistant',
                'dob' => '1997-04-18',
                'gender' => 'female',
                'phone' => '0901234574',
                'address' => '502 Staff Street, District 10, HCMC',
                'role' => User::ROLE_EMPLOYEE,
            ],
            // Additional employees without user accounts (for assignment testing)
            [
                'employee_code' => 'E0009',
                'full_name' => 'Ngô Văn Pending',
                'email' => 'pending1@mesoco.vn',
                'position' => 'Trainee Dentist',
                'dob' => '1998-08-20',
                'gender' => 'male',
                'phone' => '0901234575',
                'address' => '600 Pending Ave, District 2, HCMC',
                'role' => null, // No user account
            ],
            [
                'employee_code' => 'E0010',
                'full_name' => 'Lý Thị Thực Tập',
                'email' => 'pending2@mesoco.vn',
                'position' => 'Intern',
                'dob' => '2000-01-15',
                'gender' => 'female',
                'phone' => '0901234576',
                'address' => '601 Pending Ave, District 2, HCMC',
                'role' => null, // No user account
            ],
        ];

        foreach ($employeeData as $data) {
            $role = $data['role'];
            unset($data['role']);

            // Create/update employee
            $employee = Employee::updateOrCreate(
                ['employee_code' => $data['employee_code']],
                [
                    'full_name' => $data['full_name'],
                    'position' => $data['position'],
                    'dob' => $data['dob'],
                    'gender' => $data['gender'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'address' => $data['address'],
                    'status' => 'active',
                ]
            );

            $this->employees[$data['employee_code']] = $employee;

            // Create user account if role specified
            if ($role) {
                $user = User::updateOrCreate(
                    ['employee_code' => $data['employee_code']],
                    [
                        'name' => $data['full_name'],
                        'email' => $data['email'],
                        'password' => Hash::make(self::DEFAULT_PASSWORD),
                        'employee_id' => $employee->id,
                        'role' => $role,
                        'status' => 'active',
                        'must_change_password' => false,
                    ]
                );
                $this->users[$data['employee_code']] = $user;
            }
        }

        $this->command->info("   Created/updated " . count($employeeData) . " employees");
        $this->command->info("   Created/updated " . count($this->users) . " user accounts");
    }

    /**
     * Seed assets with valuation data.
     */
    private function seedAssets(): void
    {
        $this->command->info('🏥 Seeding assets...');

        $assetsData = [
            // === MACHINES (10) - High-value equipment ===
            [
                'asset_code' => 'MSA-0001',
                'name' => 'Dental Panoramic X-Ray System',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Imaging Room',
                'notes' => 'Main panoramic X-ray unit for diagnostic imaging',
                'purchase_date' => '2022-06-15',
                'purchase_cost' => 120000000, // 120M VND
                'useful_life_months' => 120,
                'salvage_value' => 12000000,
                'warranty_expiry' => '2027-06-15',
            ],
            [
                'asset_code' => 'MSA-0002',
                'name' => 'Intraoral X-Ray Unit',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Room 101',
                'notes' => 'Digital intraoral sensor system',
                'purchase_date' => '2023-01-10',
                'purchase_cost' => 45000000,
                'useful_life_months' => 84,
                'salvage_value' => 4500000,
                'warranty_expiry' => '2026-01-10',
            ],
            [
                'asset_code' => 'MSA-0003',
                'name' => 'Autoclave Sterilizer Class B',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => '22L capacity, vacuum cycle',
                'purchase_date' => '2023-03-20',
                'purchase_cost' => 35000000,
                'useful_life_months' => 84,
                'salvage_value' => 3500000,
                'warranty_expiry' => '2026-03-20',
            ],
            [
                'asset_code' => 'MSA-0004',
                'name' => 'Ultrasonic Scaler Unit',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Cleaning',
                'location' => 'Room 102',
                'notes' => 'Piezoelectric scaler with LED',
                'purchase_date' => '2024-02-01',
                'purchase_cost' => 15000000,
                'useful_life_months' => 60,
                'salvage_value' => 1500000,
                'warranty_expiry' => '2026-08-01', // Expiring soon
            ],
            [
                'asset_code' => 'MSA-0005',
                'name' => 'CAD/CAM Milling Machine',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Lab Area',
                'notes' => 'Same-day crown fabrication system',
                'purchase_date' => '2023-09-01',
                'purchase_cost' => 250000000,
                'useful_life_months' => 120,
                'salvage_value' => 25000000,
                'warranty_expiry' => '2028-09-01',
            ],
            [
                'asset_code' => 'MSA-0006',
                'name' => 'Dental Laser Unit (Diode)',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Treatment',
                'location' => 'Room 103',
                'notes' => 'Soft tissue laser - scheduled calibration',
                'purchase_date' => '2023-05-15',
                'purchase_cost' => 65000000,
                'useful_life_months' => 84,
                'salvage_value' => 6500000,
                'warranty_expiry' => '2026-05-15',
            ],
            [
                'asset_code' => 'MSA-0007',
                'name' => 'Dental Compressor (Oil-free)',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => '3HP oil-free compressor, 100L tank',
                'purchase_date' => '2022-01-01',
                'purchase_cost' => 28000000,
                'useful_life_months' => 120,
                'salvage_value' => 2800000,
                'warranty_expiry' => '2025-01-01', // Expired
            ],
            [
                'asset_code' => 'MSA-0008',
                'name' => 'Suction Unit (Central)',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => 'Dry vacuum system for 5 chairs',
                'purchase_date' => '2022-06-01',
                'purchase_cost' => 42000000,
                'useful_life_months' => 120,
                'salvage_value' => 4200000,
                'warranty_expiry' => '2027-06-01',
            ],
            [
                'asset_code' => 'MSA-0009',
                'name' => 'Water Purification System',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_OFF_SERVICE,
                'category' => 'Infrastructure',
                'location' => 'Storage',
                'notes' => 'Decommissioned - replaced with newer model',
                'purchase_date' => '2019-03-01',
                'purchase_cost' => 18000000,
                'useful_life_months' => 60,
                'salvage_value' => 1800000,
                'warranty_expiry' => '2022-03-01',
            ],
            [
                'asset_code' => 'MSA-0010',
                'name' => 'Dental CT Scanner (CBCT)',
                'type' => Asset::TYPE_MACHINE,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Imaging Room',
                'notes' => '3D cone beam computed tomography',
                'purchase_date' => '2024-01-15',
                'purchase_cost' => 350000000,
                'useful_life_months' => 120,
                'salvage_value' => 35000000,
                'warranty_expiry' => '2029-01-15',
            ],

            // === EQUIPMENT (40) - Dental chairs and major equipment ===
            [
                'asset_code' => 'MSA-0011',
                'name' => 'Dental Chair Unit #1',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 101',
                'notes' => 'Full-featured treatment unit with delivery system',
                'purchase_date' => '2022-08-01',
                'purchase_cost' => 85000000,
                'useful_life_months' => 180,
                'salvage_value' => 8500000,
                'warranty_expiry' => '2027-08-01',
            ],
            [
                'asset_code' => 'MSA-0012',
                'name' => 'Dental Chair Unit #2',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 102',
                'notes' => 'Full-featured treatment unit with delivery system',
                'purchase_date' => '2022-08-01',
                'purchase_cost' => 85000000,
                'useful_life_months' => 180,
                'salvage_value' => 8500000,
                'warranty_expiry' => '2027-08-01',
            ],
            [
                'asset_code' => 'MSA-0013',
                'name' => 'Dental Chair Unit #3',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 103',
                'notes' => 'Full-featured treatment unit with delivery system',
                'purchase_date' => '2023-02-15',
                'purchase_cost' => 92000000,
                'useful_life_months' => 180,
                'salvage_value' => 9200000,
                'warranty_expiry' => '2028-02-15',
            ],
            [
                'asset_code' => 'MSA-0014',
                'name' => 'Light Curing Unit (LED)',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 101',
                'notes' => 'Cordless LED curing light',
                'purchase_date' => '2024-06-01',
                'purchase_cost' => 8500000,
                'useful_life_months' => 36,
                'salvage_value' => 850000,
                'warranty_expiry' => '2026-06-01',
            ],
            [
                'asset_code' => 'MSA-0015',
                'name' => 'Light Curing Unit (LED) #2',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 102',
                'notes' => 'Cordless LED curing light',
                'purchase_date' => '2024-06-01',
                'purchase_cost' => 8500000,
                'useful_life_months' => 36,
                'salvage_value' => 850000,
                'warranty_expiry' => '2026-06-01',
            ],
            [
                'asset_code' => 'MSA-0016',
                'name' => 'Apex Locator',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 101',
                'notes' => 'Electronic apex locator for endodontics',
                'purchase_date' => '2023-11-01',
                'purchase_cost' => 12000000,
                'useful_life_months' => 60,
                'salvage_value' => 1200000,
                'warranty_expiry' => '2025-11-01',
            ],
            [
                'asset_code' => 'MSA-0017',
                'name' => 'Endomotor System',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 102',
                'notes' => 'Rotary endodontic motor with torque control',
                'purchase_date' => '2024-03-01',
                'purchase_cost' => 18000000,
                'useful_life_months' => 60,
                'salvage_value' => 1800000,
                'warranty_expiry' => '2027-03-01',
            ],
            [
                'asset_code' => 'MSA-0018',
                'name' => 'Dental Operating Microscope',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 103',
                'notes' => 'Surgical microscope for endodontics',
                'purchase_date' => '2023-07-01',
                'purchase_cost' => 75000000,
                'useful_life_months' => 120,
                'salvage_value' => 7500000,
                'warranty_expiry' => '2028-07-01',
            ],
            [
                'asset_code' => 'MSA-0019',
                'name' => 'Intraoral Scanner',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Imaging',
                'location' => 'Lab Area',
                'notes' => 'Digital impression scanner - software update pending',
                'purchase_date' => '2024-01-01',
                'purchase_cost' => 95000000,
                'useful_life_months' => 84,
                'salvage_value' => 9500000,
                'warranty_expiry' => '2027-01-01',
            ],
            [
                'asset_code' => 'MSA-0020',
                'name' => 'Portable Suction Unit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_RETIRED,
                'category' => 'Treatment',
                'location' => 'Storage',
                'notes' => 'Retired - motor failure, not economical to repair',
                'purchase_date' => '2018-05-01',
                'purchase_cost' => 8000000,
                'useful_life_months' => 60,
                'salvage_value' => 800000,
                'warranty_expiry' => '2020-05-01',
            ],
            [
                'asset_code' => 'MSA-0036',
                'name' => 'Portable Dental Cart System',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 104',
                'notes' => 'Mobile cart with integrated power and suction outlets',
                'purchase_date' => '2024-09-10',
                'purchase_cost' => 28000000,
                'useful_life_months' => 84,
                'salvage_value' => 2800000,
                'warranty_expiry' => '2027-09-10',
            ],
            [
                'asset_code' => 'MSA-0037',
                'name' => 'Implant Motor Unit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 104',
                'notes' => 'Surgical implant motor with torque calibration module',
                'purchase_date' => '2023-12-12',
                'purchase_cost' => 42000000,
                'useful_life_months' => 96,
                'salvage_value' => 4200000,
                'warranty_expiry' => '2026-12-12',
            ],
            [
                'asset_code' => 'MSA-0038',
                'name' => 'Electric Pulp Tester',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 105',
                'notes' => 'Chairside vitality testing device for endodontic assessment',
                'purchase_date' => '2025-01-08',
                'purchase_cost' => 6800000,
                'useful_life_months' => 48,
                'salvage_value' => 680000,
                'warranty_expiry' => '2027-01-08',
            ],
            [
                'asset_code' => 'MSA-0039',
                'name' => 'Dental Vibrator Table',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Other',
                'location' => 'Lab Area',
                'notes' => 'Bench-top model for stone and impression casting work',
                'purchase_date' => '2022-10-15',
                'purchase_cost' => 7200000,
                'useful_life_months' => 72,
                'salvage_value' => 720000,
                'warranty_expiry' => '2026-10-15',
            ],
            [
                'asset_code' => 'MSA-0040',
                'name' => 'Vacuum Mixer for Impression Materials',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Lab Area',
                'notes' => 'Reduces bubbles in alginate and stone mixtures',
                'purchase_date' => '2024-02-20',
                'purchase_cost' => 13800000,
                'useful_life_months' => 72,
                'salvage_value' => 1380000,
                'warranty_expiry' => '2027-02-20',
            ],
            [
                'asset_code' => 'MSA-0041',
                'name' => 'Plasma Air Sterilizer',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Low-temperature sterilization for sensitive accessories',
                'purchase_date' => '2024-07-01',
                'purchase_cost' => 36000000,
                'useful_life_months' => 84,
                'salvage_value' => 3600000,
                'warranty_expiry' => '2027-07-01',
            ],
            [
                'asset_code' => 'MSA-0042',
                'name' => 'UV Sterilization Cabinet',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Lamp replacement and timer calibration in progress',
                'purchase_date' => '2021-06-18',
                'purchase_cost' => 15000000,
                'useful_life_months' => 72,
                'salvage_value' => 1500000,
                'warranty_expiry' => '2024-06-18',
            ],
            [
                'asset_code' => 'MSA-0043',
                'name' => 'Distilled Water Processor',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_OFF_SERVICE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => 'Stopped due to unstable output pressure',
                'purchase_date' => '2020-04-01',
                'purchase_cost' => 22000000,
                'useful_life_months' => 84,
                'salvage_value' => 2200000,
                'warranty_expiry' => '2023-04-01',
                'off_service_reason' => 'Water purity below threshold, awaiting membrane replacement',
                'off_service_from' => now()->subDays(12),
            ],
            [
                'asset_code' => 'MSA-0044',
                'name' => 'Oil-Free Air Compressor #2',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => 'Backup compressed air source for treatment rooms',
                'purchase_date' => '2023-09-25',
                'purchase_cost' => 47000000,
                'useful_life_months' => 96,
                'salvage_value' => 4700000,
                'warranty_expiry' => '2026-09-25',
            ],
            [
                'asset_code' => 'MSA-0045',
                'name' => 'Vacuum Suction Pump Station',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => 'Central suction support for three adjacent chairs',
                'purchase_date' => '2023-05-05',
                'purchase_cost' => 39500000,
                'useful_life_months' => 96,
                'salvage_value' => 3950000,
                'warranty_expiry' => '2026-05-05',
            ],
            [
                'asset_code' => 'MSA-0046',
                'name' => 'Mobile Instrument Trolley A',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Furniture',
                'location' => 'Room 101',
                'notes' => 'Three-tier trolley for sterile packs and chairside tools',
                'purchase_date' => '2024-08-16',
                'purchase_cost' => 5200000,
                'useful_life_months' => 60,
                'salvage_value' => 520000,
                'warranty_expiry' => '2026-08-16',
            ],
            [
                'asset_code' => 'MSA-0047',
                'name' => 'Mobile Instrument Trolley B',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Furniture',
                'location' => 'Room 102',
                'notes' => 'Three-tier trolley for sterile packs and chairside tools',
                'purchase_date' => '2024-08-16',
                'purchase_cost' => 5200000,
                'useful_life_months' => 60,
                'salvage_value' => 520000,
                'warranty_expiry' => '2026-08-16',
            ],
            [
                'asset_code' => 'MSA-0048',
                'name' => 'Patient Monitoring Module',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Surgery Room',
                'notes' => 'Tracks pulse and oxygen saturation during sedation cases',
                'purchase_date' => '2023-10-08',
                'purchase_cost' => 19500000,
                'useful_life_months' => 72,
                'salvage_value' => 1950000,
                'warranty_expiry' => '2026-10-08',
            ],
            [
                'asset_code' => 'MSA-0049',
                'name' => 'Oral Surgery LED Headlight System',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 104',
                'notes' => 'Wearable surgical lighting with battery pack',
                'purchase_date' => '2024-04-30',
                'purchase_cost' => 9800000,
                'useful_life_months' => 48,
                'salvage_value' => 980000,
                'warranty_expiry' => '2027-04-30',
            ],
            [
                'asset_code' => 'MSA-0050',
                'name' => 'Photographic Documentation Kit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Imaging Room',
                'notes' => 'Clinic DSLR kit for case documentation and treatment planning',
                'purchase_date' => '2023-06-22',
                'purchase_cost' => 26500000,
                'useful_life_months' => 60,
                'salvage_value' => 2650000,
                'warranty_expiry' => '2026-06-22',
            ],
            [
                'asset_code' => 'MSA-0051',
                'name' => 'Shade Matching Device',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Lab Area',
                'notes' => 'Digital shade selection for prosthodontic cases',
                'purchase_date' => '2025-02-14',
                'purchase_cost' => 14500000,
                'useful_life_months' => 60,
                'salvage_value' => 1450000,
                'warranty_expiry' => '2027-02-14',
            ],
            [
                'asset_code' => 'MSA-0052',
                'name' => 'Endodontic Obturation System',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 101',
                'notes' => 'Warm vertical condensation unit with cordless handpieces',
                'purchase_date' => '2024-05-18',
                'purchase_cost' => 17500000,
                'useful_life_months' => 60,
                'salvage_value' => 1750000,
                'warranty_expiry' => '2027-05-18',
            ],
            [
                'asset_code' => 'MSA-0053',
                'name' => 'Piezo Surgery Unit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 104',
                'notes' => 'Ultrasonic bone surgery unit for implant and extraction cases',
                'purchase_date' => '2023-03-11',
                'purchase_cost' => 48000000,
                'useful_life_months' => 84,
                'salvage_value' => 4800000,
                'warranty_expiry' => '2026-03-11',
            ],
            [
                'asset_code' => 'MSA-0054',
                'name' => 'Vital Signs Monitor',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Recovery Area',
                'notes' => 'Portable monitor for post-procedure observation',
                'purchase_date' => '2024-10-03',
                'purchase_cost' => 11800000,
                'useful_life_months' => 60,
                'salvage_value' => 1180000,
                'warranty_expiry' => '2027-10-03',
            ],
            [
                'asset_code' => 'MSA-0055',
                'name' => 'Medical Grade Refrigerator',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Storage',
                'notes' => 'Temperature-controlled storage for biomaterials and anesthetics',
                'purchase_date' => '2022-12-01',
                'purchase_cost' => 16500000,
                'useful_life_months' => 84,
                'salvage_value' => 1650000,
                'warranty_expiry' => '2025-12-01',
            ],
            [
                'asset_code' => 'MSA-0056',
                'name' => 'Steam Distiller',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Provides distilled water for autoclaves and cleaning systems',
                'purchase_date' => '2024-01-25',
                'purchase_cost' => 8900000,
                'useful_life_months' => 60,
                'salvage_value' => 890000,
                'warranty_expiry' => '2027-01-25',
            ],
            [
                'asset_code' => 'MSA-0057',
                'name' => 'Instrument Washer-Disinfector',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Cleaning',
                'location' => 'Sterilization Room',
                'notes' => 'Drain pump inspection and detergent dosing recalibration',
                'purchase_date' => '2021-11-14',
                'purchase_cost' => 52000000,
                'useful_life_months' => 96,
                'salvage_value' => 5200000,
                'warranty_expiry' => '2024-11-14',
            ],
            [
                'asset_code' => 'MSA-0058',
                'name' => 'Dental Vacuum Forming Machine',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Lab Area',
                'notes' => 'Fabricates bleaching trays and retainers in-house',
                'purchase_date' => '2023-08-09',
                'purchase_cost' => 10800000,
                'useful_life_months' => 72,
                'salvage_value' => 1080000,
                'warranty_expiry' => '2026-08-09',
            ],
            [
                'asset_code' => 'MSA-0059',
                'name' => 'Soft Tissue Laser Unit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Treatment',
                'location' => 'Room 105',
                'notes' => 'Diode laser for gingivectomy and soft tissue contouring',
                'purchase_date' => '2023-01-19',
                'purchase_cost' => 45500000,
                'useful_life_months' => 84,
                'salvage_value' => 4550000,
                'warranty_expiry' => '2026-01-19',
            ],
            [
                'asset_code' => 'MSA-0060',
                'name' => 'Portable X-Ray Sensor Kit',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Imaging Room',
                'notes' => 'Sensor and docking kit for mobile intraoral imaging',
                'purchase_date' => '2024-11-19',
                'purchase_cost' => 32000000,
                'useful_life_months' => 72,
                'salvage_value' => 3200000,
                'warranty_expiry' => '2027-11-19',
            ],
            [
                'asset_code' => 'MSA-0061',
                'name' => 'Intraoral Camera System #2',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Imaging',
                'location' => 'Room 102',
                'notes' => 'HD camera system for patient communication and records',
                'purchase_date' => '2025-01-05',
                'purchase_cost' => 12500000,
                'useful_life_months' => 60,
                'salvage_value' => 1250000,
                'warranty_expiry' => '2027-01-05',
            ],
            [
                'asset_code' => 'MSA-0062',
                'name' => 'Mobile Emergency Cart',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Furniture',
                'location' => 'Hallway A',
                'notes' => 'Emergency medications and response tools cart',
                'purchase_date' => '2024-03-27',
                'purchase_cost' => 14000000,
                'useful_life_months' => 72,
                'salvage_value' => 1400000,
                'warranty_expiry' => '2027-03-27',
            ],
            [
                'asset_code' => 'MSA-0063',
                'name' => 'Backup UPS for CBCT',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Infrastructure',
                'location' => 'Imaging Room',
                'notes' => 'Power conditioning and short-term backup for imaging hardware',
                'purchase_date' => '2022-09-09',
                'purchase_cost' => 24000000,
                'useful_life_months' => 72,
                'salvage_value' => 2400000,
                'warranty_expiry' => '2025-09-09',
            ],
            [
                'asset_code' => 'MSA-0064',
                'name' => 'Compressor Dryer Module',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Infrastructure',
                'location' => 'Utility Room',
                'notes' => 'Moisture trap replacement and airflow balancing',
                'purchase_date' => '2020-07-17',
                'purchase_cost' => 17500000,
                'useful_life_months' => 72,
                'salvage_value' => 1750000,
                'warranty_expiry' => '2023-07-17',
            ],
            [
                'asset_code' => 'MSA-0065',
                'name' => 'Old Portable Examination Light',
                'type' => Asset::TYPE_EQUIPMENT,
                'status' => Asset::STATUS_RETIRED,
                'category' => 'Furniture',
                'location' => 'Storage',
                'notes' => 'Retired after repeated ballast failures and poor illumination output',
                'purchase_date' => '2017-09-01',
                'purchase_cost' => 4500000,
                'useful_life_months' => 48,
                'salvage_value' => 450000,
                'warranty_expiry' => '2019-09-01',
            ],

            // === TOOLS (8) - Handpieces and instruments ===
            [
                'asset_code' => 'MSA-0021',
                'name' => 'High-Speed Handpiece Set A',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 101',
                'notes' => 'LED turbine handpiece with fiber optic',
                'purchase_date' => '2024-01-15',
                'purchase_cost' => 6500000,
                'useful_life_months' => 36,
                'salvage_value' => 650000,
                'warranty_expiry' => '2026-01-15',
            ],
            [
                'asset_code' => 'MSA-0022',
                'name' => 'High-Speed Handpiece Set B',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 102',
                'notes' => 'LED turbine handpiece with fiber optic',
                'purchase_date' => '2024-01-15',
                'purchase_cost' => 6500000,
                'useful_life_months' => 36,
                'salvage_value' => 650000,
                'warranty_expiry' => '2026-01-15',
            ],
            [
                'asset_code' => 'MSA-0023',
                'name' => 'Low-Speed Handpiece Kit',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 101',
                'notes' => 'Contra-angle and straight handpiece set',
                'purchase_date' => '2023-09-01',
                'purchase_cost' => 4500000,
                'useful_life_months' => 48,
                'salvage_value' => 450000,
                'warranty_expiry' => '2025-09-01',
            ],
            [
                'asset_code' => 'MSA-0024',
                'name' => 'Surgical Handpiece',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 103',
                'notes' => 'Implant surgical motor handpiece',
                'purchase_date' => '2023-12-01',
                'purchase_cost' => 12000000,
                'useful_life_months' => 60,
                'salvage_value' => 1200000,
                'warranty_expiry' => '2026-12-01',
            ],
            [
                'asset_code' => 'MSA-0025',
                'name' => 'Extraction Forceps Set',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 102',
                'notes' => 'Complete extraction forceps kit - 12 pieces',
                'purchase_date' => '2023-06-01',
                'purchase_cost' => 3500000,
                'useful_life_months' => 60,
                'salvage_value' => 350000,
                'warranty_expiry' => '2025-06-01',
            ],
            [
                'asset_code' => 'MSA-0026',
                'name' => 'Surgical Elevator Set',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 103',
                'notes' => 'Luxator and elevator set - 8 pieces',
                'purchase_date' => '2023-06-01',
                'purchase_cost' => 2800000,
                'useful_life_months' => 60,
                'salvage_value' => 280000,
                'warranty_expiry' => '2025-06-01',
            ],
            [
                'asset_code' => 'MSA-0027',
                'name' => 'Periodontal Instrument Set',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_MAINTENANCE,
                'category' => 'Handpieces',
                'location' => 'Sterilization Room',
                'notes' => 'Being resharpened',
                'purchase_date' => '2022-10-01',
                'purchase_cost' => 4200000,
                'useful_life_months' => 48,
                'salvage_value' => 420000,
                'warranty_expiry' => '2024-10-01',
            ],
            [
                'asset_code' => 'MSA-0028',
                'name' => 'Endodontic File Set',
                'type' => Asset::TYPE_TOOL,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Handpieces',
                'location' => 'Room 101',
                'notes' => 'NiTi rotary file system',
                'purchase_date' => '2024-04-01',
                'purchase_cost' => 5500000,
                'useful_life_months' => 24,
                'salvage_value' => 0,
                'warranty_expiry' => '2025-04-01',
            ],

            // === TRAYS (5) - Instrument trays ===
            [
                'asset_code' => 'MSA-0029',
                'name' => 'Basic Examination Tray',
                'type' => Asset::TYPE_TRAY,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Mirror, explorer, cotton pliers set',
                'purchase_date' => '2024-01-01',
                'purchase_cost' => 2500000,
                'useful_life_months' => 24,
                'salvage_value' => 250000,
                'warranty_expiry' => '2025-01-01',
            ],
            [
                'asset_code' => 'MSA-0030',
                'name' => 'Composite Restoration Tray',
                'type' => Asset::TYPE_TRAY,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Complete composite filling instrument set',
                'purchase_date' => '2024-02-01',
                'purchase_cost' => 3800000,
                'useful_life_months' => 24,
                'salvage_value' => 380000,
                'warranty_expiry' => '2025-02-01',
            ],
            [
                'asset_code' => 'MSA-0031',
                'name' => 'Surgical Extraction Tray',
                'type' => Asset::TYPE_TRAY,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Surgical extraction instrument cassette',
                'purchase_date' => '2023-08-01',
                'purchase_cost' => 5200000,
                'useful_life_months' => 36,
                'salvage_value' => 520000,
                'warranty_expiry' => '2025-08-01',
            ],
            [
                'asset_code' => 'MSA-0032',
                'name' => 'Orthodontic Bracket Tray',
                'type' => Asset::TYPE_TRAY,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Room 102',
                'notes' => 'Bracket placement and adjustment instruments',
                'purchase_date' => '2024-03-01',
                'purchase_cost' => 4500000,
                'useful_life_months' => 30,
                'salvage_value' => 450000,
                'warranty_expiry' => '2025-09-01',
            ],
            [
                'asset_code' => 'MSA-0033',
                'name' => 'Implant Surgical Tray',
                'type' => Asset::TYPE_TRAY,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Room 103',
                'notes' => 'Complete implant surgery instrument cassette',
                'purchase_date' => '2023-10-01',
                'purchase_cost' => 8500000,
                'useful_life_months' => 48,
                'salvage_value' => 850000,
                'warranty_expiry' => '2026-10-01',
            ],

            // === OTHER (2) - Misc items ===
            [
                'asset_code' => 'MSA-0034',
                'name' => 'Patient Monitor',
                'type' => Asset::TYPE_OTHER,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Other',
                'location' => 'Room 103',
                'notes' => 'Vital signs monitor for sedation cases',
                'purchase_date' => '2023-04-01',
                'purchase_cost' => 25000000,
                'useful_life_months' => 84,
                'salvage_value' => 2500000,
                'warranty_expiry' => '2026-04-01',
            ],
            [
                'asset_code' => 'MSA-0035',
                'name' => 'Instrument Washer-Disinfector',
                'type' => Asset::TYPE_OTHER,
                'status' => Asset::STATUS_ACTIVE,
                'category' => 'Sterilization',
                'location' => 'Sterilization Room',
                'notes' => 'Automatic instrument pre-cleaning unit',
                'purchase_date' => '2023-03-01',
                'purchase_cost' => 45000000,
                'useful_life_months' => 120,
                'salvage_value' => 4500000,
                'warranty_expiry' => '2028-03-01',
            ],
        ];

        foreach ($assetsData as $data) {
            $asset = Asset::updateOrCreate(
                ['asset_code' => $data['asset_code']],
                array_merge($data, ['depreciation_method' => Asset::DEPRECIATION_TIME])
            );
            $this->assets[$data['asset_code']] = $asset;
        }

        $this->command->info("   Created/updated " . count($assetsData) . " assets");
    }

    /**
     * Seed QR identities for all assets.
     */
    private function seedQrIdentities(): void
    {
        $this->command->info('📱 Seeding QR identities...');

        $created = 0;
        foreach ($this->assets as $code => $asset) {
            // Only create if not exists
            if (!$asset->qrIdentity) {
                AssetQrIdentity::create([
                    'qr_uid' => (string) Str::uuid(),
                    'asset_id' => $asset->id,
                    'payload_version' => 'v1',
                ]);
                $created++;
            }
        }

        $this->command->info("   Created {$created} new QR identities");
    }

    /**
     * Seed asset assignments.
     */
    private function seedAssignments(): void
    {
        $this->command->info('📋 Seeding assignments...');

        $adminUser = $this->users['E0001'];

        $assignments = [
            // Doctor 1 (E0003) - 3 active assignments
            ['asset' => 'MSA-0002', 'employee' => 'E0003', 'days_ago' => 60],
            ['asset' => 'MSA-0014', 'employee' => 'E0003', 'days_ago' => 45],
            ['asset' => 'MSA-0021', 'employee' => 'E0003', 'days_ago' => 30],
            
            // Doctor 2 (E0004) - 2 active assignments
            ['asset' => 'MSA-0013', 'employee' => 'E0004', 'days_ago' => 90],
            ['asset' => 'MSA-0032', 'employee' => 'E0004', 'days_ago' => 50],
            
            // Technician 1 (E0005) - 3 active assignments
            ['asset' => 'MSA-0003', 'employee' => 'E0005', 'days_ago' => 120],
            ['asset' => 'MSA-0004', 'employee' => 'E0005', 'days_ago' => 80],
            ['asset' => 'MSA-0022', 'employee' => 'E0005', 'days_ago' => 40],
            
            // Technician 2 (E0006) - 2 active assignments
            ['asset' => 'MSA-0005', 'employee' => 'E0006', 'days_ago' => 100],
            ['asset' => 'MSA-0019', 'employee' => 'E0006', 'days_ago' => 60],
            
            // Staff 1 (E0007) - 1 active assignment
            ['asset' => 'MSA-0029', 'employee' => 'E0007', 'days_ago' => 20],
            
            // Staff 2 (E0008) - 2 active assignments
            ['asset' => 'MSA-0030', 'employee' => 'E0008', 'days_ago' => 25],
            ['asset' => 'MSA-0031', 'employee' => 'E0008', 'days_ago' => 15],
        ];

        foreach ($assignments as $data) {
            $asset = $this->assets[$data['asset']];
            $employee = $this->employees[$data['employee']];

            AssetAssignment::updateOrCreate(
                ['asset_id' => $asset->id, 'unassigned_at' => null],
                [
                    'employee_id' => $employee->id,
                    'assigned_by' => $adminUser->id,
                    'assigned_at' => now()->subDays($data['days_ago']),
                ]
            );
        }

        // Historical assignments (unassigned)
        $historicalAssignments = [
            [
                'asset' => 'MSA-0011',
                'employee' => 'E0003',
                'assigned_days_ago' => 180,
                'unassigned_days_ago' => 90,
            ],
            [
                'asset' => 'MSA-0016',
                'employee' => 'E0005',
                'assigned_days_ago' => 150,
                'unassigned_days_ago' => 60,
            ],
        ];

        foreach ($historicalAssignments as $data) {
            $asset = $this->assets[$data['asset']];
            $employee = $this->employees[$data['employee']];

            // Check if historical record exists
            $exists = AssetAssignment::where('asset_id', $asset->id)
                ->where('employee_id', $employee->id)
                ->whereNotNull('unassigned_at')
                ->exists();

            if (!$exists) {
                AssetAssignment::create([
                    'asset_id' => $asset->id,
                    'employee_id' => $employee->id,
                    'assigned_by' => $adminUser->id,
                    'assigned_at' => now()->subDays($data['assigned_days_ago']),
                    'unassigned_at' => now()->subDays($data['unassigned_days_ago']),
                ]);
            }
        }

        $this->command->info("   Created/updated " . (count($assignments) + count($historicalAssignments)) . " assignments");
    }

    /**
     * Seed requests with events.
     */
    private function seedRequests(): void
    {
        if (!Schema::hasTable('requests')) {
            $this->command->info('📝 Skipping requests; request workflow is outside the current scope.');
            return;
        }

        $this->command->info('📝 Seeding requests...');

        $requests = [
            // JUSTIFICATION requests
            [
                'code' => 'REQ-202501-0001',
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by' => 'E0003',
                'title' => 'High-speed handpiece malfunction',
                'description' => 'The high-speed handpiece (MSA-0021) is making unusual noise during operation. Requesting maintenance check.',
                'severity' => 'medium',
                'suspected_cause' => 'wear',
                'incident_at' => now()->subDays(2)->format('Y-m-d H:i:s'),
            ],
            [
                'code' => 'REQ-202501-0002',
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'status' => AssetRequest::STATUS_APPROVED,
                'requested_by' => 'E0005',
                'reviewed_by' => 'E0001',
                'review_note' => 'Approved. Scheduling autoclave service next week.',
                'title' => 'Autoclave cycle incomplete',
                'description' => 'The autoclave (MSA-0003) is not completing its cycle properly. Sterilization indicator strips show failure.',
                'severity' => 'high',
                'suspected_cause' => 'operation',
                'incident_at' => now()->subDays(5)->format('Y-m-d H:i:s'),
            ],
            [
                'code' => 'REQ-202501-0003',
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'status' => AssetRequest::STATUS_REJECTED,
                'requested_by' => 'E0004',
                'reviewed_by' => 'E0002',
                'review_note' => 'This is normal operating behavior per manufacturer specs. No action required.',
                'title' => 'Chair hydraulic movement slow',
                'description' => 'Dental chair #3 (MSA-0013) hydraulic lift is slower than usual.',
                'severity' => 'low',
                'suspected_cause' => 'unknown',
                'incident_at' => now()->subDays(10)->format('Y-m-d H:i:s'),
            ],

            // ASSET_LOAN requests
            [
                'code' => 'REQ-202501-0004',
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by' => 'E0006',
                'title' => 'Borrow microscope for complex endo case',
                'description' => 'Need to borrow the dental microscope (MSA-0018) from Room 103 for a complex root canal treatment scheduled tomorrow.',
            ],
            [
                'code' => 'REQ-202501-0005',
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'status' => AssetRequest::STATUS_APPROVED,
                'requested_by' => 'E0003',
                'reviewed_by' => 'E0001',
                'review_note' => 'Approved for 3-day loan period.',
                'title' => 'Portable suction for home visit',
                'description' => 'Requesting portable suction unit for scheduled home visit to elderly patient.',
            ],
            [
                'code' => 'REQ-202501-0006',
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'status' => AssetRequest::STATUS_CANCELLED,
                'requested_by' => 'E0008',
                'title' => 'Light curing unit for training',
                'description' => 'Need extra light curing unit for dental assistant training session.',
            ],

            // CONSUMABLE_REQUEST requests
            [
                'code' => 'REQ-202501-0007',
                'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by' => 'E0007',
                'title' => 'Dental disposables restock',
                'description' => 'Running low on examination gloves and face masks. Need to reorder.',
            ],
            [
                'code' => 'REQ-202501-0008',
                'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
                'status' => AssetRequest::STATUS_APPROVED,
                'requested_by' => 'E0005',
                'reviewed_by' => 'E0002',
                'review_note' => 'Approved. Order placed with supplier.',
                'title' => 'Sterilization pouches order',
                'description' => 'Need to order sterilization pouches (500 medium, 200 large) for autoclave.',
            ],
            [
                'code' => 'REQ-202501-0009',
                'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
                'status' => AssetRequest::STATUS_REJECTED,
                'requested_by' => 'E0004',
                'reviewed_by' => 'E0001',
                'review_note' => 'Stock already ordered last week. Check supply room.',
                'title' => 'Composite material restock',
                'description' => 'Requesting composite resin materials A2, A3, B1 shades.',
            ],
            [
                'code' => 'REQ-202501-0010',
                'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by' => 'E0003',
                'title' => 'Orthodontic brackets order',
                'description' => 'Need metal brackets and ceramic brackets for upcoming orthodontic cases.',
            ],
        ];

        foreach ($requests as $data) {
            $requestedByEmployee = $this->employees[$data['requested_by']];
            $reviewedByUser = isset($data['reviewed_by']) ? $this->users[$data['reviewed_by']] : null;

            $request = AssetRequest::updateOrCreate(
                ['code' => $data['code']],
                [
                    'type' => $data['type'],
                    'status' => $data['status'],
                    'requested_by_employee_id' => $requestedByEmployee->id,
                    'reviewed_by_user_id' => $reviewedByUser?->id,
                    'reviewed_at' => $reviewedByUser ? now()->subDays(rand(1, 3)) : null,
                    'review_note' => $data['review_note'] ?? null,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'severity' => $data['severity'] ?? null,
                    'incident_at' => $data['incident_at'] ?? null,
                    'suspected_cause' => $data['suspected_cause'] ?? null,
                ]
            );

            // Create request events
            $this->createRequestEvents($request, $data);
        }

        $this->command->info("   Created/updated " . count($requests) . " requests with events");
    }

    /**
     * Create events for a request.
     */
    private function createRequestEvents(AssetRequest $request, array $data): void
    {
        $requestedByUser = $this->users[$data['requested_by']] ?? null;

        // CREATED event
        RequestEvent::updateOrCreate(
            [
                'request_id' => $request->id,
                'event_type' => RequestEvent::TYPE_CREATED,
            ],
            [
                'actor_user_id' => $requestedByUser?->id,
                'meta' => json_encode(['type' => $data['type']]),
                'created_at' => $request->created_at,
            ]
        );

        // SUBMITTED event (if not draft)
        if ($data['status'] !== 'DRAFT') {
            RequestEvent::updateOrCreate(
                [
                    'request_id' => $request->id,
                    'event_type' => RequestEvent::TYPE_SUBMITTED,
                ],
                [
                    'actor_user_id' => $requestedByUser?->id,
                    'meta' => null,
                    'created_at' => $request->created_at->addMinutes(5),
                ]
            );
        }

        // Approval/Rejection events
        if ($data['status'] === AssetRequest::STATUS_APPROVED && isset($data['reviewed_by'])) {
            RequestEvent::updateOrCreate(
                [
                    'request_id' => $request->id,
                    'event_type' => RequestEvent::TYPE_APPROVED,
                ],
                [
                    'actor_user_id' => $this->users[$data['reviewed_by']]->id,
                    'meta' => json_encode(['note' => $data['review_note'] ?? '']),
                    'created_at' => $request->reviewed_at ?? now(),
                ]
            );
        }

        if ($data['status'] === AssetRequest::STATUS_REJECTED && isset($data['reviewed_by'])) {
            RequestEvent::updateOrCreate(
                [
                    'request_id' => $request->id,
                    'event_type' => RequestEvent::TYPE_REJECTED,
                ],
                [
                    'actor_user_id' => $this->users[$data['reviewed_by']]->id,
                    'meta' => json_encode(['note' => $data['review_note'] ?? '']),
                    'created_at' => $request->reviewed_at ?? now(),
                ]
            );
        }

        if ($data['status'] === AssetRequest::STATUS_CANCELLED) {
            RequestEvent::updateOrCreate(
                [
                    'request_id' => $request->id,
                    'event_type' => RequestEvent::TYPE_CANCELLED,
                ],
                [
                    'actor_user_id' => $requestedByUser?->id,
                    'meta' => json_encode(['reason' => 'User cancelled']),
                    'created_at' => $request->updated_at ?? now(),
                ]
            );
        }
    }

    /**
     * Seed asset checkins.
     */
    private function seedCheckins(): void
    {
        $this->command->info('✅ Seeding check-ins...');

        $morningShift = $this->shifts['morning'];
        $afternoonShift = $this->shifts['afternoon'];

        $checkins = [
            // Doctor 1 check-ins
            [
                'asset' => 'MSA-0002',
                'employee' => 'E0003',
                'shift' => $morningShift,
                'days_ago' => 7,
                'in_hour' => 8, 'in_minute' => 30,
                'out_hour' => 12, 'out_minute' => 0,
                'source' => 'qr',
                'notes' => 'Routine diagnostic imaging',
            ],
            [
                'asset' => 'MSA-0014',
                'employee' => 'E0003',
                'shift' => $afternoonShift,
                'days_ago' => 5,
                'in_hour' => 13, 'in_minute' => 15,
                'out_hour' => 17, 'out_minute' => 0,
                'source' => 'manual',
                'notes' => 'Composite restoration cases',
            ],
            [
                'asset' => 'MSA-0021',
                'employee' => 'E0003',
                'shift' => $morningShift,
                'days_ago' => 3,
                'in_hour' => 9, 'in_minute' => 0,
                'out_hour' => 11, 'out_minute' => 45,
                'source' => 'qr',
                'notes' => 'Crown preparations',
            ],
            
            // Technician check-ins
            [
                'asset' => 'MSA-0003',
                'employee' => 'E0005',
                'shift' => $morningShift,
                'days_ago' => 4,
                'in_hour' => 8, 'in_minute' => 0,
                'out_hour' => 12, 'out_minute' => 0,
                'source' => 'qr',
                'notes' => 'Sterilization cycle run',
            ],
            [
                'asset' => 'MSA-0004',
                'employee' => 'E0005',
                'shift' => $afternoonShift,
                'days_ago' => 2,
                'in_hour' => 14, 'in_minute' => 0,
                'out_hour' => 16, 'out_minute' => 30,
                'source' => 'manual',
                'notes' => 'Deep cleaning procedures',
            ],
            
            // Doctor 2 check-ins
            [
                'asset' => 'MSA-0013',
                'employee' => 'E0004',
                'shift' => $morningShift,
                'days_ago' => 6,
                'in_hour' => 8, 'in_minute' => 45,
                'out_hour' => 12, 'out_minute' => 15,
                'source' => 'qr',
                'notes' => 'Orthodontic adjustments',
            ],
            
            // Active check-in (not checked out yet)
            [
                'asset' => 'MSA-0032',
                'employee' => 'E0004',
                'shift' => $morningShift,
                'days_ago' => 0,
                'in_hour' => 8, 'in_minute' => 30,
                'out_hour' => null, 'out_minute' => null,
                'source' => 'qr',
                'notes' => 'Current session - orthodontic procedures',
            ],
            
            // Staff check-in
            [
                'asset' => 'MSA-0029',
                'employee' => 'E0007',
                'shift' => $morningShift,
                'days_ago' => 1,
                'in_hour' => 8, 'in_minute' => 15,
                'out_hour' => 11, 'out_minute' => 45,
                'source' => 'manual',
                'notes' => 'Examination tray preparation',
            ],
        ];

        foreach ($checkins as $data) {
            $asset = $this->assets[$data['asset']];
            $employee = $this->employees[$data['employee']];
            $shiftDate = now()->subDays($data['days_ago'])->format('Y-m-d');

            $checkinTime = now()->subDays($data['days_ago'])
                ->setHour($data['in_hour'])
                ->setMinute($data['in_minute']);

            $checkoutTime = $data['out_hour'] !== null
                ? now()->subDays($data['days_ago'])
                    ->setHour($data['out_hour'])
                    ->setMinute($data['out_minute'])
                : null;

            AssetCheckin::updateOrCreate(
                [
                    'asset_id' => $asset->id,
                    'employee_id' => $employee->id,
                    'shift_date' => $shiftDate,
                    'shift_id' => $data['shift']->id,
                ],
                [
                    'checked_in_at' => $checkinTime,
                    'checked_out_at' => $checkoutTime,
                    'source' => $data['source'],
                    'notes' => $data['notes'],
                ]
            );
        }

        $this->command->info("   Created/updated " . count($checkins) . " check-in records");
    }

    /**
     * Seed maintenance events for demo.
     */
    private function seedMaintenanceEvents(): void
    {
        $this->command->info('🔧 Seeding maintenance events...');

        $admin = $this->users['E0001']; // Admin Nguyen
        $technician = $this->users['E0004']; // Technician Pham

        $maintenanceEvents = [
            [
                'asset_key' => 'MSA-0001', // Dental Panoramic X-Ray System
                'type' => 'preventive',
                'status' => MaintenanceEvent::STATUS_COMPLETED,
                'priority' => 'normal',
                'planned_at' => now()->subDays(10),
                'started_at' => now()->subDays(10),
                'completed_at' => now()->subDays(10),
                'note' => 'Annual preventive maintenance - calibration and cleaning',
                'result_note' => 'All systems checked and calibrated successfully',
                'cost' => 500000,
                'assigned_to' => 'Technician Pham',
                'created_by' => $admin->id,
            ],
            [
                'asset_key' => 'MSA-0011', // Ultrasonic Scaler
                'type' => 'repair',
                'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
                'priority' => 'high',
                'planned_at' => now()->subDays(1),
                'started_at' => now()->subDays(1),
                'completed_at' => null,
                'note' => 'Scaler tip replacement needed - unusual vibration reported',
                'result_note' => null,
                'cost' => null,
                'assigned_to' => 'Technician Pham',
                'created_by' => $technician->id,
            ],
            [
                'asset_key' => 'MSA-0012', // LED Curing Light
                'type' => 'inspection',
                'status' => MaintenanceEvent::STATUS_SCHEDULED,
                'priority' => 'normal',
                'planned_at' => now()->addDays(3),
                'started_at' => null,
                'completed_at' => null,
                'note' => 'Monthly light intensity verification',
                'result_note' => null,
                'cost' => null,
                'assigned_to' => 'Technician Pham',
                'created_by' => $admin->id,
            ],
            [
                'asset_key' => 'MSA-0003', // Dental Chair A
                'type' => 'preventive',
                'status' => MaintenanceEvent::STATUS_SCHEDULED,
                'priority' => 'high',
                'planned_at' => now()->addDays(7),
                'started_at' => null,
                'completed_at' => null,
                'note' => 'Quarterly chair servicing - hydraulics and electronics check',
                'result_note' => null,
                'cost' => null,
                'assigned_to' => 'External Vendor',
                'created_by' => $admin->id,
            ],
            [
                'asset_key' => 'MSA-0006', // Autoclave
                'type' => 'calibration',
                'status' => MaintenanceEvent::STATUS_CANCELED,
                'priority' => 'normal',
                'planned_at' => now()->subDays(5),
                'started_at' => null,
                'completed_at' => null,
                'note' => 'Calibration scheduled',
                'result_note' => 'Canceled: Equipment was replaced with new unit',
                'cost' => null,
                'assigned_to' => 'Technician Pham',
                'created_by' => $admin->id,
            ],
        ];

        $count = 0;
        foreach ($maintenanceEvents as $data) {
            if (!isset($this->assets[$data['asset_key']])) {
                continue;
            }

            $asset = $this->assets[$data['asset_key']];
            $code = MaintenanceEvent::generateCode();

            MaintenanceEvent::updateOrCreate(
                [
                    'asset_id' => $asset->id,
                    'planned_at' => $data['planned_at'],
                    'type' => $data['type'],
                ],
                [
                    'code' => $code,
                    'status' => $data['status'],
                    'priority' => $data['priority'],
                    'note' => $data['note'],
                    'result_note' => $data['result_note'],
                    'cost' => $data['cost'],
                    'started_at' => $data['started_at'],
                    'completed_at' => $data['completed_at'],
                    'assigned_to' => $data['assigned_to'],
                    'created_by' => $data['created_by'],
                    'updated_by' => $data['created_by'],
                ]
            );
            $count++;
        }

        $this->command->info("   Created/updated {$count} maintenance events");
    }

    /**
     * Seed feedback for demo.
     */
    private function seedFeedback(): void
    {
        $this->command->info('💬 Seeding feedback...');

        $doctor = $this->users['E0003']; // Dr. Tran Minh
        $nurse = $this->users['E0006']; // Nurse Le Thi
        $admin = $this->users['E0001']; // Admin Nguyen

        $feedbacks = [
            [
                'user_id' => $doctor->id,
                'asset_key' => 'MSA-0001', // Dental Panoramic X-Ray System
                'type' => 'suggestion',
                'content' => 'The X-Ray scanner could benefit from better image export options. Currently, we have to manually adjust each export which takes extra time during busy periods.',
                'rating' => 4,
                'status' => Feedback::STATUS_NEW,
            ],
            [
                'user_id' => $nurse->id,
                'asset_key' => 'MSA-0011', // Ultrasonic Scaler
                'type' => 'issue',
                'content' => 'The scaler is making unusual vibration sounds. Reported to technician team for inspection. Seems like the tip might need replacement.',
                'rating' => 3,
                'status' => Feedback::STATUS_IN_PROGRESS,
            ],
            [
                'user_id' => $doctor->id,
                'asset_key' => null,
                'type' => 'praise',
                'content' => 'Great job on the recent maintenance of all dental chairs! Everything is running smoothly and the patients have noticed the improvement.',
                'rating' => 5,
                'status' => Feedback::STATUS_RESOLVED,
                'resolved_by' => $admin->id,
                'resolved_at' => now()->subDays(2),
            ],
            [
                'user_id' => $nurse->id,
                'asset_key' => 'MSA-0012', // LED Curing Light
                'type' => 'issue',
                'content' => 'Battery life seems shorter than expected. Please check if the battery needs replacement.',
                'rating' => 3,
                'status' => Feedback::STATUS_NEW,
            ],
            [
                'user_id' => $doctor->id,
                'asset_key' => 'MSA-0003', // Dental Chair A
                'type' => 'suggestion',
                'content' => 'Consider adding headrest covers to the chair accessories. Many patients have mentioned they would appreciate this.',
                'rating' => 4,
                'status' => Feedback::STATUS_NEW,
            ],
        ];

        $count = 0;
        foreach ($feedbacks as $data) {
            $assetId = null;
            if ($data['asset_key'] && isset($this->assets[$data['asset_key']])) {
                $assetId = $this->assets[$data['asset_key']]->id;
            }

            $code = Feedback::generateCode();

            Feedback::updateOrCreate(
                [
                    'user_id' => $data['user_id'],
                    'content' => $data['content'],
                ],
                [
                    'code' => $code,
                    'asset_id' => $assetId,
                    'type' => $data['type'],
                    'rating' => $data['rating'] ?? null,
                    'status' => $data['status'],
                    'resolved_by' => $data['resolved_by'] ?? null,
                    'resolved_at' => $data['resolved_at'] ?? null,
                ]
            );
            $count++;
        }

        $this->command->info("   Created/updated {$count} feedback records");
    }

    /**
     * Print summary of seeded data.
     */
    private function printSummary(): void
    {
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('                    📊 SEED SUMMARY                     ');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->newLine();

        $this->command->table(
            ['Entity', 'Count'],
            [
                ['Locations', Location::count()],
                ['Shifts', Shift::count()],
                ['Employees', Employee::count()],
                ['Users (with login)', User::count()],
                ['Assets', Asset::count()],
                ['QR Identities', AssetQrIdentity::count()],
                ['Assignments', AssetAssignment::count()],
                ['Requests', Schema::hasTable('requests') ? AssetRequest::count() : 0],
                ['Request Events', Schema::hasTable('request_events') ? RequestEvent::count() : 0],
                ['Check-ins', AssetCheckin::count()],
                ['Maintenance Events', MaintenanceEvent::count()],
                ['Feedback', Feedback::count()],
            ]
        );

        $this->command->newLine();
        $this->command->info('🔑 Demo Accounts (Password: ' . self::DEFAULT_PASSWORD . ')');
        $this->command->info('───────────────────────────────────────────────────────');
        
        $accounts = User::with('employee')
            ->whereIn('employee_code', ['E0001', 'E0002', 'E0003', 'E0004', 'E0005', 'E0006', 'E0007', 'E0008'])
            ->get();

        $this->command->table(
            ['Employee Code', 'Name', 'Role', 'Email'],
            $accounts->map(fn ($u) => [
                $u->employee_code,
                $u->name,
                strtoupper($u->role),
                $u->email,
            ])->toArray()
        );

        $this->command->newLine();
    }
}
