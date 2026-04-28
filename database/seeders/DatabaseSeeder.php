<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\Employee;
use App\Models\Location;
use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a small IT asset management dataset.
     *
     * This seeder is intentionally compact and idempotent:
     * - creates a few employees and user accounts
     * - creates canonical asset locations
     * - creates representative IT assets
     * - creates responsible employee assignments
     * - creates a few maintenance events for reporting flows
     */
    public function run(): void
    {
        $this->call(ShiftSeeder::class);

        $people = $this->seedEmployeesAndUsers();
        $locations = $this->seedLocations();
        $assets = $this->seedAssets($locations);
        $this->seedAssignments($people, $assets);
        $this->seedMaintenanceEvents($people, $assets);
    }

    /**
     * Create demo employees and matching user accounts.
     *
     * @return array<string, Employee>
     */
    private function seedEmployeesAndUsers(): array
    {
        $rows = [
            'manager' => [
                'employee_code' => 'E1001',
                'full_name' => 'Nguyen Van An',
                'position' => 'IT Operations Manager',
                'department' => null,
                'email' => 'manager@mesoco.vn',
                'role' => User::ROLE_MANAGER,
            ],
            'technician' => [
                'employee_code' => 'E1002',
                'full_name' => 'Tran Thi Binh',
                'position' => 'IT Support Technician',
                'department' => null,
                'email' => 'technician@mesoco.vn',
                'role' => User::ROLE_TECHNICIAN,
            ],
            'employee' => [
                'employee_code' => 'E1003',
                'full_name' => 'Le Minh Cuong',
                'position' => 'Office Staff',
                'department' => null,
                'email' => 'employee@mesoco.vn',
                'role' => User::ROLE_EMPLOYEE,
            ],
            'frontdesk' => [
                'employee_code' => 'E1004',
                'full_name' => 'Pham Thi Dung',
                'position' => 'Front Desk Staff',
                'department' => null,
                'email' => 'frontdesk@mesoco.vn',
                'role' => User::ROLE_EMPLOYEE,
            ],
            'warehouse' => [
                'employee_code' => 'E1005',
                'full_name' => 'Hoang Van Em',
                'position' => 'Warehouse Staff',
                'department' => null,
                'email' => 'warehouse@mesoco.vn',
                'role' => User::ROLE_EMPLOYEE,
            ],
        ];

        $people = [];

        foreach ($rows as $key => $row) {
            $employee = Employee::updateOrCreate(
                ['employee_code' => $row['employee_code']],
                [
                    'full_name' => $row['full_name'],
                    'position' => $row['position'],
                    'department' => $row['department'],
                    'email' => $row['email'],
                    'dob' => '1990-01-01',
                    'gender' => 'other',
                    'phone' => null,
                    'address' => 'Ho Chi Minh City',
                    'status' => 'active',
                ]
            );

            User::updateOrCreate(
                ['employee_id' => $employee->id],
                [
                    'employee_code' => $employee->employee_code,
                    'name' => $employee->full_name,
                    'email' => $employee->email,
                    'role' => $row['role'],
                    'password' => Hash::make('password'),
                    'must_change_password' => false,
                    'status' => 'active',
                ]
            );

            $people[$key] = $employee;
        }

        return $people;
    }

    /**
     * Create canonical locations for asset placement.
     *
     * @return array<string, Location>
     */
    private function seedLocations(): array
    {
        $rows = [
            'it_storage' => [
                'code' => 'LOC-001',
                'name' => 'Kho IT',
                'description' => 'Nơi lưu thiết bị IT chưa cấp phát hoặc đang chờ xử lý.',
            ],
            'support_room' => [
                'code' => 'LOC-002',
                'name' => 'Phòng kỹ thuật',
                'description' => 'Khu vực kỹ thuật viên kiểm tra và sửa thiết bị.',
            ],
            'office_area' => [
                'code' => 'LOC-003',
                'name' => 'Khu làm việc nhân viên',
                'description' => 'Khu vực nhân viên sử dụng thiết bị hằng ngày.',
            ],
            'server_room' => [
                'code' => 'LOC-004',
                'name' => 'Phòng server',
                'description' => 'Khu vực đặt thiết bị mạng và server.',
            ],
        ];

        $locations = [];

        foreach ($rows as $key => $row) {
            $locations[$key] = Location::updateOrCreate(
                ['code' => $row['code']],
                $row + ['is_active' => true]
            );
        }

        return $locations;
    }

    /**
     * Create representative IT assets.
     *
     * @return array<string, Asset>
     */
    private function seedAssets(array $locations): array
    {
        $rows = [
            'laptop' => [
                'asset_code' => 'IT-LAP-001',
                'name' => 'Dell Latitude 5440',
                'type' => Asset::TYPE_EQUIPMENT,
                'category' => 'Laptop',
                'location_key' => 'support_room',
                'purchase_date' => '2025-01-10',
                'purchase_cost' => 28000000,
                'useful_life_months' => 48,
                'salvage_value' => 2800000,
                'status' => Asset::STATUS_ACTIVE,
            ],
            'desktop' => [
                'asset_code' => 'IT-DES-001',
                'name' => 'HP EliteDesk 800 G9',
                'type' => Asset::TYPE_EQUIPMENT,
                'category' => 'Desktop',
                'location_key' => 'office_area',
                'purchase_date' => '2024-10-18',
                'purchase_cost' => 22000000,
                'useful_life_months' => 60,
                'salvage_value' => 2200000,
                'status' => Asset::STATUS_ACTIVE,
            ],
            'monitor' => [
                'asset_code' => 'IT-MON-001',
                'name' => 'LG 27-inch Monitor',
                'type' => Asset::TYPE_EQUIPMENT,
                'category' => 'Monitor',
                'location_key' => 'office_area',
                'purchase_date' => '2024-08-21',
                'purchase_cost' => 6500000,
                'useful_life_months' => 36,
                'salvage_value' => 650000,
                'status' => Asset::STATUS_ACTIVE,
            ],
            'network' => [
                'asset_code' => 'IT-NET-001',
                'name' => 'Cisco Catalyst Switch',
                'type' => Asset::TYPE_MACHINE,
                'category' => 'Network',
                'location_key' => 'server_room',
                'purchase_date' => '2024-05-05',
                'purchase_cost' => 45000000,
                'useful_life_months' => 72,
                'salvage_value' => 4500000,
                'status' => Asset::STATUS_ACTIVE,
            ],
            'server' => [
                'asset_code' => 'IT-SRV-001',
                'name' => 'Dell PowerEdge R450',
                'type' => Asset::TYPE_MACHINE,
                'category' => 'Server',
                'location_key' => 'server_room',
                'purchase_date' => '2024-03-12',
                'purchase_cost' => 98000000,
                'useful_life_months' => 84,
                'salvage_value' => 9800000,
                'status' => Asset::STATUS_ACTIVE,
            ],
            'printer' => [
                'asset_code' => 'IT-PRN-001',
                'name' => 'HP LaserJet Pro M404dn',
                'type' => Asset::TYPE_EQUIPMENT,
                'category' => 'Printer',
                'location_key' => 'it_storage',
                'purchase_date' => '2024-12-02',
                'purchase_cost' => 8900000,
                'useful_life_months' => 48,
                'salvage_value' => 890000,
                'status' => Asset::STATUS_ACTIVE,
            ],
        ];

        $assets = [];

        foreach ($rows as $key => $row) {
            $location = $locations[$row['location_key']] ?? null;
            unset($row['location_key']);

            $assets[$key] = Asset::updateOrCreate(
                ['asset_code' => $row['asset_code']],
                $row + [
                    'location_id' => $location?->id,
                    'location' => $location?->name,
                    'depreciation_method' => Asset::DEPRECIATION_TIME,
                    'warranty_expiry' => now()->addYears(2)->toDateString(),
                    'notes' => 'Seeded IT asset for location and responsible employee workflows.',
                ]
            );
        }

        return $assets;
    }

    /**
     * Create active responsible employee assignments.
     *
     * @param array<string, Employee> $people
     * @param array<string, Asset> $assets
     */
    private function seedAssignments(array $people, array $assets): void
    {
        $assignments = [
            ['asset' => 'laptop', 'employee' => 'technician'],
            ['asset' => 'desktop', 'employee' => 'employee'],
            ['asset' => 'monitor', 'employee' => 'frontdesk'],
            ['asset' => 'network', 'employee' => 'manager'],
            ['asset' => 'server', 'employee' => 'technician'],
            ['asset' => 'printer', 'employee' => 'warehouse'],
        ];

        foreach ($assignments as $row) {
            $asset = $assets[$row['asset']] ?? null;
            if (!$asset || $asset->currentAssignment) {
                continue;
            }

            AssetAssignment::create([
                'asset_id' => $asset->id,
                'employee_id' => $people[$row['employee']]?->id,
                'department_name' => null,
                'assigned_by' => $people['manager']->user?->id,
                'assigned_at' => now()->subDays(7),
            ]);
        }
    }

    /**
     * Create a couple of maintenance events for reporting flows.
     *
     * @param array<string, Employee> $people
     * @param array<string, Asset> $assets
     */
    private function seedMaintenanceEvents(array $people, array $assets): void
    {
        $managerUser = $people['manager']->user;
        $technicianUser = $people['technician']->user;

        if (!$managerUser || !$technicianUser) {
            return;
        }

        $events = [
            [
                'code' => 'MNT-IT-001',
                'asset' => 'laptop',
                'type' => MaintenanceEvent::TYPE_SOFTWARE_UPDATE,
                'status' => MaintenanceEvent::STATUS_COMPLETED,
                'planned_at' => now()->subDays(14),
                'started_at' => now()->subDays(14)->addHours(2),
                'completed_at' => now()->subDays(14)->addHours(4),
                'priority' => MaintenanceEvent::PRIORITY_NORMAL,
                'note' => 'Applied security updates and endpoint protection refresh.',
                'result_note' => 'Completed successfully.',
                'estimated_duration_minutes' => 120,
                'actual_duration_minutes' => 110,
                'cost' => 0,
                'created_by' => $managerUser->id,
                'updated_by' => $managerUser->id,
                'assigned_to_user_id' => $technicianUser->id,
            ],
            [
                'code' => 'MNT-IT-002',
                'asset' => 'server',
                'type' => MaintenanceEvent::TYPE_PREVENTIVE,
                'status' => MaintenanceEvent::STATUS_SCHEDULED,
                'planned_at' => now()->addDays(5),
                'priority' => MaintenanceEvent::PRIORITY_HIGH,
                'note' => 'Preventive check for CPU load, RAID health, and backup verification.',
                'estimated_duration_minutes' => 180,
                'created_by' => $managerUser->id,
                'updated_by' => $managerUser->id,
                'assigned_to_user_id' => $technicianUser->id,
            ],
        ];

        foreach ($events as $event) {
            $asset = $assets[$event['asset']] ?? null;
            if (!$asset) {
                continue;
            }

            MaintenanceEvent::updateOrCreate(
                ['code' => $event['code']],
                [
                    'asset_id' => $asset->id,
                    'type' => $event['type'],
                    'status' => $event['status'],
                    'planned_at' => $event['planned_at'],
                    'started_at' => $event['started_at'] ?? null,
                    'completed_at' => $event['completed_at'] ?? null,
                    'priority' => $event['priority'],
                    'note' => $event['note'],
                    'result_note' => $event['result_note'] ?? null,
                    'estimated_duration_minutes' => $event['estimated_duration_minutes'] ?? null,
                    'actual_duration_minutes' => $event['actual_duration_minutes'] ?? null,
                    'cost' => $event['cost'] ?? null,
                    'assigned_to_user_id' => $event['assigned_to_user_id'] ?? null,
                    'created_by' => $event['created_by'],
                    'updated_by' => $event['updated_by'],
                ]
            );
        }
    }
}
