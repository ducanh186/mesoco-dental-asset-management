<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\EmployeeContract;
use App\Models\Feedback;
use App\Models\MaintenanceEvent;
use App\Models\RequestItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * DemoSeeder - Idempotent seeder for demo data
 * 
 * Run with: php artisan db:seed --class=DemoSeeder
 * 
 * This seeder ensures all demo accounts and demo data exist.
 * Safe to run multiple times.
 */
class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Running DemoSeeder...');

        // ====================================================================
        // STEP 1: Ensure demo accounts have correct password and email
        // ====================================================================
        $this->seedDemoAccounts();

        // ====================================================================
        // STEP 2: Ensure demo requests exist
        // ====================================================================
        $this->seedDemoRequests();

        // ====================================================================
        // STEP 3: Ensure maintenance events exist
        // ====================================================================
        $this->seedMaintenanceEvents();

        // ====================================================================
        // STEP 4: Ensure feedbacks exist
        // ====================================================================
        $this->seedFeedbacks();

        // ====================================================================
        // STEP 5: Ensure contracts exist
        // ====================================================================
        $this->seedContracts();

        // ====================================================================
        // STEP 6: Sync ERD-aligned tables from legacy/demo data
        // ====================================================================
        $this->call(ErdAlignmentSeeder::class);

        $this->command->info('✅ DemoSeeder completed!');
    }

    /**
     * Ensure demo accounts exist with correct password
     */
    private function seedDemoAccounts(): void
    {
        $this->command->info('  → Updating demo accounts...');

        $accounts = [
            ['code' => 'E0001', 'role' => User::ROLE_MANAGER, 'email' => 'manager@mesoco.vn'],
            ['code' => 'E0002', 'role' => User::ROLE_TECHNICIAN, 'email' => 'technician@mesoco.vn'],
            ['code' => 'E0003', 'role' => User::ROLE_DOCTOR, 'email' => 'doctor@mesoco.vn'],
            ['code' => 'E0004', 'role' => User::ROLE_TECHNICIAN, 'email' => 'tech@mesoco.vn'],
            ['code' => 'E0005', 'role' => User::ROLE_EMPLOYEE, 'email' => 'staff@mesoco.vn'],
        ];

        foreach ($accounts as $account) {
            // Update employee email if needed
            Employee::where('employee_code', $account['code'])
                ->update(['email' => $account['email']]);

            // Update user password and email
            User::where('employee_code', $account['code'])
                ->update([
                    'email' => $account['email'],
                    'role' => $account['role'],
                    'password' => Hash::make('password'),
                    'must_change_password' => false,
                ]);
        }

        $this->command->info('    ✓ Demo accounts updated with password: password');
    }

    /**
     * Seed demo requests (4 minimum)
     */
    private function seedDemoRequests(): void
    {
        $this->command->info('  → Seeding demo requests...');

        $doctor = Employee::where('employee_code', 'E0003')->first();
        $staff = Employee::where('employee_code', 'E0005')->first();
        $adminUser = User::where('employee_code', 'E0001')->first();

        if (!$doctor || !$staff) {
            $this->command->warn('    ⚠ Employees not found, skipping requests');
            return;
        }

        // 1. JUSTIFICATION pending (Doctor reports broken equipment)
        $req1 = AssetRequest::firstOrCreate(
            ['code' => 'REQ-DEMO-001'],
            [
                'type' => AssetRequest::TYPE_JUSTIFICATION,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by_employee_id' => $doctor->id,
                'title' => 'Dental X-Ray Unit showing error',
                'description' => 'The X-Ray unit displays error code E-05 during startup. Unable to capture images.',
                'severity' => AssetRequest::SEVERITY_HIGH,
                'incident_at' => now()->subDays(2),
                'suspected_cause' => 'unknown',
            ]
        );

        // Add request item linking to asset
        $xrayAsset = Asset::where('asset_code', 'MACH-001')->first();
        if ($xrayAsset && $req1->wasRecentlyCreated) {
            RequestItem::firstOrCreate(
                ['request_id' => $req1->id, 'asset_id' => $xrayAsset->id],
                ['item_kind' => 'ASSET', 'qty' => 1]
            );
        }

        // 2. ASSET_LOAN pending (Doctor wants to borrow mobile equipment)
        $req2 = AssetRequest::firstOrCreate(
            ['code' => 'REQ-DEMO-002'],
            [
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by_employee_id' => $doctor->id,
                'title' => 'Request to borrow portable ultrasonic scaler',
                'description' => 'Need portable ultrasonic scaler for home visit patient on Saturday.',
                'severity' => AssetRequest::SEVERITY_MEDIUM,
            ]
        );

        $scalerAsset = Asset::where('asset_code', 'MACH-002')->first();
        if ($scalerAsset && $req2->wasRecentlyCreated) {
            RequestItem::firstOrCreate(
                ['request_id' => $req2->id, 'asset_id' => $scalerAsset->id],
                ['item_kind' => 'ASSET', 'qty' => 1]
            );
        }

        // 3. CONSUMABLE_REQUEST approved (Staff requests supplies)
        $req3 = AssetRequest::firstOrCreate(
            ['code' => 'REQ-DEMO-003'],
            [
                'type' => AssetRequest::TYPE_CONSUMABLE_REQUEST,
                'status' => AssetRequest::STATUS_APPROVED,
                'requested_by_employee_id' => $staff->id,
                'reviewed_by_user_id' => $adminUser?->id,
                'reviewed_at' => now()->subDays(1),
                'review_note' => 'Approved. Please collect from storage room.',
                'title' => 'Monthly supply request - gloves and masks',
                'description' => 'Requesting 5 boxes of latex gloves and 3 boxes of surgical masks for reception area.',
                'severity' => AssetRequest::SEVERITY_LOW,
            ]
        );

        // 4. Rejected request (any type)
        AssetRequest::firstOrCreate(
            ['code' => 'REQ-DEMO-004'],
            [
                'type' => AssetRequest::TYPE_ASSET_LOAN,
                'status' => AssetRequest::STATUS_REJECTED,
                'requested_by_employee_id' => $staff->id,
                'reviewed_by_user_id' => $adminUser?->id,
                'reviewed_at' => now()->subDays(5),
                'review_note' => 'Asset is currently assigned to another employee. Please coordinate directly.',
                'title' => 'Request to use dental chair unit #1',
                'description' => 'Need to use the main dental chair for training session.',
                'severity' => AssetRequest::SEVERITY_LOW,
            ]
        );

        $this->command->info('    ✓ 4 demo requests created');
    }

    /**
     * Seed maintenance events
     */
    private function seedMaintenanceEvents(): void
    {
        $this->command->info('  → Seeding maintenance events...');

        $techUser = User::where('employee_code', 'E0004')->first();
        $adminUser = User::where('employee_code', 'E0001')->first();

        // 1. Scheduled maintenance (next week)
        $machine1 = Asset::where('asset_code', 'MACH-001')->first();
        if ($machine1) {
            MaintenanceEvent::firstOrCreate(
                ['code' => 'MNT-DEMO-001'],
                [
                    'asset_id' => $machine1->id,
                    'type' => MaintenanceEvent::TYPE_CALIBRATION,
                    'status' => MaintenanceEvent::STATUS_SCHEDULED,
                    'priority' => MaintenanceEvent::PRIORITY_NORMAL,
                    'note' => 'Annual X-Ray calibration - Scheduled annual calibration as per manufacturer guidelines.',
                    'planned_at' => now()->addDays(7),
                    'assigned_to' => $techUser?->name ?? 'Tech Team',
                    'created_by' => $adminUser?->id,
                ]
            );
        }

        // 2. In-progress maintenance (asset should be off_service)
        $machine3 = Asset::where('asset_code', 'MACH-003')->first();
        if ($machine3) {
            MaintenanceEvent::firstOrCreate(
                ['code' => 'MNT-DEMO-002'],
                [
                    'asset_id' => $machine3->id,
                    'type' => MaintenanceEvent::TYPE_REPAIR,
                    'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
                    'priority' => MaintenanceEvent::PRIORITY_HIGH,
                    'note' => 'Autoclave pressure valve replacement - Parts ordered and being replaced.',
                    'planned_at' => now()->subDays(3),
                    'started_at' => now()->subDays(2),
                    'assigned_to' => $techUser?->name ?? 'Tech Team',
                    'created_by' => $adminUser?->id,
                ]
            );

            // Ensure asset is off_service
            $machine3->update([
                'status' => 'off_service',
                'off_service_reason' => 'Under maintenance - pressure valve replacement',
                'off_service_from' => now()->subDays(2),
            ]);
        }

        // 3. Completed maintenance (for history)
        $equip1 = Asset::where('asset_code', 'EQUIP-001')->first();
        if ($equip1) {
            MaintenanceEvent::firstOrCreate(
                ['code' => 'MNT-DEMO-003'],
                [
                    'asset_id' => $equip1->id,
                    'type' => MaintenanceEvent::TYPE_INSPECTION,
                    'status' => MaintenanceEvent::STATUS_COMPLETED,
                    'priority' => MaintenanceEvent::PRIORITY_LOW,
                    'note' => 'Quarterly dental chair inspection - Routine inspection.',
                    'planned_at' => now()->subDays(14),
                    'started_at' => now()->subDays(14),
                    'completed_at' => now()->subDays(14)->addHours(2),
                    'result_note' => 'Inspection passed. Minor lubrication applied to adjustment mechanisms.',
                    'assigned_to' => $techUser?->name ?? 'Tech Team',
                    'created_by' => $adminUser?->id,
                ]
            );
        }

        $this->command->info('    ✓ Maintenance events created');
    }

    /**
     * Seed feedbacks
     */
    private function seedFeedbacks(): void
    {
        $this->command->info('  → Seeding feedbacks...');

        $doctorUser = User::where('employee_code', 'E0003')->first();
        $adminUser = User::where('employee_code', 'E0001')->first();

        if (!$doctorUser) {
            $this->command->warn('    ⚠ Doctor user not found, skipping feedbacks');
            return;
        }

        // 1. Open feedback (suggestion)
        Feedback::firstOrCreate(
            ['code' => 'FB-DEMO-001'],
            [
                'user_id' => $doctorUser->id,
                'type' => Feedback::TYPE_SUGGESTION,
                'status' => Feedback::STATUS_NEW,
                'content' => 'Suggest adding QR code scanner feature directly in the mobile app for faster check-in. Currently need to open camera app separately.',
                'rating' => 4,
            ]
        );

        // 2. Resolved feedback
        Feedback::firstOrCreate(
            ['code' => 'FB-DEMO-002'],
            [
                'user_id' => $doctorUser->id,
                'type' => Feedback::TYPE_ISSUE,
                'status' => Feedback::STATUS_RESOLVED,
                'content' => 'The light curing unit battery drains too quickly. Need replacement battery.',
                'rating' => 3,
                'response' => 'Thank you for reporting. New battery has been ordered and will be replaced during next maintenance window.',
                'resolved_by' => $adminUser?->id,
                'resolved_at' => now()->subDays(3),
            ]
        );

        $this->command->info('    ✓ 2 feedbacks created');
    }

    /**
     * Seed contracts
     */
    private function seedContracts(): void
    {
        $this->command->info('  → Seeding contracts...');

        $doctor = Employee::where('employee_code', 'E0003')->first();
        $adminUser = User::where('employee_code', 'E0001')->first();

        if (!$doctor) {
            $this->command->warn('    ⚠ Doctor employee not found, skipping contracts');
            return;
        }

        // Create demo PDF if not exists
        $pdfPath = 'contracts/demo_contract.pdf';
        if (!Storage::disk('local')->exists($pdfPath)) {
            // Create a minimal valid PDF
            $pdfContent = $this->generateMinimalPdf();
            Storage::disk('local')->put($pdfPath, $pdfContent);
            $this->command->info('    ✓ Demo PDF created');
        }

        // Create contract for Doctor
        EmployeeContract::firstOrCreate(
            ['employee_id' => $doctor->id, 'contract_type' => 'FULL_TIME'],
            [
                'department' => 'Dental Services',
                'start_date' => now()->subMonths(6)->format('Y-m-d'),
                'end_date' => now()->addMonths(18)->format('Y-m-d'),
                'status' => 'ACTIVE',
                'pdf_path' => $pdfPath,
                'created_by' => $adminUser?->id,
            ]
        );

        // Create contracts for other employees
        $hr = Employee::where('employee_code', 'E0002')->first();
        if ($hr) {
            EmployeeContract::firstOrCreate(
                ['employee_id' => $hr->id, 'contract_type' => 'FULL_TIME'],
                [
                    'department' => 'Human Resources',
                    'start_date' => now()->subYears(2)->format('Y-m-d'),
                    'end_date' => null, // Indefinite
                    'status' => 'ACTIVE',
                    'created_by' => $adminUser?->id,
                ]
            );
        }

        $tech = Employee::where('employee_code', 'E0004')->first();
        if ($tech) {
            EmployeeContract::firstOrCreate(
                ['employee_id' => $tech->id, 'contract_type' => 'FULL_TIME'],
                [
                    'department' => 'Technical Support',
                    'start_date' => now()->subMonths(3)->format('Y-m-d'),
                    'end_date' => now()->addMonths(9)->format('Y-m-d'),
                    'status' => 'ACTIVE',
                    'created_by' => $adminUser?->id,
                ]
            );
        }

        $this->command->info('    ✓ Contracts created');
    }

    /**
     * Generate a minimal valid PDF content
     */
    private function generateMinimalPdf(): string
    {
        // Minimal valid PDF structure
        return "%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 68 >>
stream
BT
/F1 24 Tf
100 700 Td
(MESOCO DENTAL - Demo Contract) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000384 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
463
%%EOF";
    }
}
