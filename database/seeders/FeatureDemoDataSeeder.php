<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetQrIdentity;
use App\Models\AssetRequest;
use App\Models\Disposal;
use App\Models\DisposalDetail;
use App\Models\Employee;
use App\Models\Feedback;
use App\Models\InventoryCheck;
use App\Models\InventoryCheckItem;
use App\Models\Location;
use App\Models\MaintenanceDetail;
use App\Models\MaintenanceEvent;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\RepairLog;
use App\Models\RequestEvent;
use App\Models\RequestItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;

class FeatureDemoDataSeeder extends Seeder
{
    private const ASSET_COUNT = 100;
    private const PURCHASE_ORDER_COUNT = 24;
    private const INVENTORY_CHECK_COUNT = 10;

    public function run(): void
    {
        $manager = User::query()->where('role', User::ROLE_MANAGER)->first() ?? User::query()->first();
        $technician = User::query()->where('role', User::ROLE_TECHNICIAN)->first() ?? $manager;
        $users = User::query()->whereNotNull('employee_id')->get();
        $employees = Employee::query()->whereIn('id', $users->pluck('employee_id')->filter())->get();

        if (!$manager || !$technician || $employees->isEmpty()) {
            throw new RuntimeException(
                'FeatureDemoDataSeeder needs existing users with linked employees. It intentionally does not create users.'
            );
        }

        DB::transaction(function () use ($manager, $technician, $users, $employees) {
            $locations = $this->seedLocations();
            $suppliers = $this->seedSuppliers();
            $assets = $this->seedAssets($locations, $suppliers);

            $this->seedAssignments($assets, $employees, $manager);
            $this->seedMaintenance($assets, $suppliers, $manager, $technician);
            $this->seedRequests($assets, $employees, $manager, $technician);
            $this->seedFeedbacks($assets, $users, $manager);
            $this->seedPurchaseOrders($assets, $suppliers, $manager);
            $this->seedInventoryChecks($assets, $manager, $technician);
            $this->seedDisposals($assets, $manager);
        });
    }

    /**
     * @return Collection<int, Location>
     */
    private function seedLocations(): Collection
    {
        $rows = [
            ['code' => 'DEMO-LOC-001', 'name' => 'Demo - Kho IT tầng 1', 'address' => 'Tầng 1 - Khu A'],
            ['code' => 'DEMO-LOC-002', 'name' => 'Demo - Phòng kỹ thuật', 'address' => 'Tầng 2 - Khu A'],
            ['code' => 'DEMO-LOC-003', 'name' => 'Demo - Phòng server', 'address' => 'Tầng 3 - Khu B'],
            ['code' => 'DEMO-LOC-004', 'name' => 'Demo - Khu lễ tân', 'address' => 'Tầng trệt'],
            ['code' => 'DEMO-LOC-005', 'name' => 'Demo - Phòng kế toán', 'address' => 'Tầng 2 - Khu B'],
            ['code' => 'DEMO-LOC-006', 'name' => 'Demo - Phòng nhân sự', 'address' => 'Tầng 2 - Khu C'],
            ['code' => 'DEMO-LOC-007', 'name' => 'Demo - Phòng họp lớn', 'address' => 'Tầng 4'],
            ['code' => 'DEMO-LOC-008', 'name' => 'Demo - Kho thiết bị cũ', 'address' => 'Tầng hầm B1'],
            ['code' => 'DEMO-LOC-009', 'name' => 'Demo - Khu vận hành', 'address' => 'Tầng 5'],
            ['code' => 'DEMO-LOC-010', 'name' => 'Demo - Khu đào tạo', 'address' => 'Tầng 6'],
        ];

        return collect($rows)->map(fn (array $row) => Location::updateOrCreate(
            ['code' => $row['code']],
            [
                'name' => $row['name'],
                'address' => $row['address'],
                'description' => 'Vị trí demo dùng để kiểm thử danh mục, bàn giao, kiểm kê và báo cáo.',
                'is_active' => true,
            ]
        ))->values();
    }

    /**
     * @return Collection<int, Supplier>
     */
    private function seedSuppliers(): Collection
    {
        $rows = [
            ['code' => 'DEMO-SUP-001', 'name' => 'FPT Services', 'contact_person' => 'Nguyen Minh Khoa'],
            ['code' => 'DEMO-SUP-002', 'name' => 'CMC Technology', 'contact_person' => 'Tran Hoai Nam'],
            ['code' => 'DEMO-SUP-003', 'name' => 'Dell Authorized Partner', 'contact_person' => 'Le Thu Ha'],
            ['code' => 'DEMO-SUP-004', 'name' => 'HP Vietnam Partner', 'contact_person' => 'Pham Quang Huy'],
            ['code' => 'DEMO-SUP-005', 'name' => 'Cisco Network Partner', 'contact_person' => 'Vo Thanh Dat'],
            ['code' => 'DEMO-SUP-006', 'name' => 'Synology Storage Partner', 'contact_person' => 'Do Minh Anh'],
            ['code' => 'DEMO-SUP-007', 'name' => 'An Phat Computer', 'contact_person' => 'Dang Bao Chau'],
            ['code' => 'DEMO-SUP-008', 'name' => 'Phong Vu Business', 'contact_person' => 'Huynh Gia Bao'],
        ];

        return collect($rows)->map(fn (array $row, int $index) => Supplier::updateOrCreate(
            ['code' => $row['code']],
            [
                'name' => $row['name'],
                'contact_person' => $row['contact_person'],
                'phone' => sprintf('090%07d', $index + 1000),
                'email' => sprintf('demo-supplier-%02d@mesoco.vn', $index + 1),
                'address' => 'Ho Chi Minh City',
                'note' => 'Nhà cung cấp demo cho luồng mua hàng, bảo trì và bảo hành.',
            ]
        ))->values();
    }

    /**
     * @param Collection<int, Location> $locations
     * @param Collection<int, Supplier> $suppliers
     * @return Collection<int, Asset>
     */
    private function seedAssets(Collection $locations, Collection $suppliers): Collection
    {
        $templates = [
            ['category' => 'Laptop', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'Dell Latitude 5440', 'model' => 'Latitude 5440', 'cost' => 28000000, 'life' => 48],
            ['category' => 'Laptop', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'HP EliteBook 840 G10', 'model' => 'EliteBook 840 G10', 'cost' => 31000000, 'life' => 48],
            ['category' => 'Desktop', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'HP EliteDesk 800 G9', 'model' => 'EliteDesk 800 G9', 'cost' => 22000000, 'life' => 60],
            ['category' => 'Monitor', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'LG UltraFine 27 inch', 'model' => '27UP850N', 'cost' => 7500000, 'life' => 48],
            ['category' => 'Network', 'type' => Asset::TYPE_MACHINE, 'name' => 'Cisco Catalyst Switch', 'model' => 'C9200L-24T', 'cost' => 46000000, 'life' => 72],
            ['category' => 'Server', 'type' => Asset::TYPE_MACHINE, 'name' => 'Dell PowerEdge R450', 'model' => 'R450', 'cost' => 98000000, 'life' => 84],
            ['category' => 'Printer', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'HP LaserJet Pro', 'model' => 'M404dn', 'cost' => 8900000, 'life' => 48],
            ['category' => 'Peripheral', 'type' => Asset::TYPE_TOOL, 'name' => 'Logitech Keyboard Mouse Kit', 'model' => 'MK545', 'cost' => 1200000, 'life' => 24],
            ['category' => 'Mobile Device', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'Samsung Galaxy Tab', 'model' => 'Tab A9+', 'cost' => 6500000, 'life' => 36],
            ['category' => 'Office Device', 'type' => Asset::TYPE_EQUIPMENT, 'name' => 'Meeting Room Webcam', 'model' => 'Logitech C930e', 'cost' => 3200000, 'life' => 36],
        ];

        return collect(range(1, self::ASSET_COUNT))->map(function (int $number) use ($templates, $locations, $suppliers) {
            $template = $templates[($number - 1) % count($templates)];
            $status = $this->statusForAsset($number);
            $location = $status === Asset::STATUS_RETIRED ? null : $locations[($number - 1) % $locations->count()];
            $supplier = $suppliers[($number - 1) % $suppliers->count()];
            $purchaseDate = now()->subMonths(6 + (($number * 3) % 72))->subDays($number % 20);
            $purchaseCost = $template['cost'] + (($number % 7) * 750000);
            $warrantyMonths = [12, 24, 36, 48][($number - 1) % 4];

            $asset = Asset::updateOrCreate(
                ['asset_code' => sprintf('DEMO-IT-%03d', $number)],
                [
                    'serial_number' => sprintf('SN-DEMO-%03d-%04d', $number, 3000 + $number),
                    'name' => $template['name'] . ' #' . str_pad((string) $number, 3, '0', STR_PAD_LEFT),
                    'model' => $template['model'],
                    'configuration' => $this->configurationFor($template['category'], $number),
                    'type' => $template['type'],
                    'category' => $template['category'],
                    'location_id' => $location?->id,
                    'supplier_id' => $supplier->id,
                    'location' => $location?->name,
                    'status' => $status,
                    'notes' => 'Demo feature data: dùng để kiểm thử danh mục, QR, bàn giao, bảo trì, kiểm kê và báo cáo.',
                    'instructions_url' => sprintf('https://intranet.mesoco.vn/assets/demo-it-%03d', $number),
                    'purchase_date' => $purchaseDate->toDateString(),
                    'purchase_cost' => $purchaseCost,
                    'purchase_price' => $purchaseCost,
                    'useful_life_months' => $template['life'],
                    'salvage_value' => round($purchaseCost * 0.1, 2),
                    'depreciation_method' => Asset::DEPRECIATION_TIME,
                    'warranty_expiry' => $purchaseDate->copy()->addMonths($warrantyMonths)->toDateString(),
                    'warranty_period_months' => $warrantyMonths,
                    'off_service_reason' => $status === Asset::STATUS_OFF_SERVICE ? 'Tạm ngưng sử dụng để kiểm tra an toàn điện.' : null,
                    'off_service_from' => $status === Asset::STATUS_OFF_SERVICE ? now()->subDays($number % 12 + 1) : null,
                    'off_service_until' => $status === Asset::STATUS_OFF_SERVICE ? now()->addDays($number % 10 + 3) : null,
                ]
            );

            $qrIdentities = AssetQrIdentity::query()
                ->where('asset_id', $asset->id)
                ->where('payload_version', 'v1')
                ->orderBy('id')
                ->get();

            $qrIdentity = $qrIdentities->first();

            if (!$qrIdentity) {
                $qrIdentity = AssetQrIdentity::create([
                    'asset_id' => $asset->id,
                    'payload_version' => 'v1',
                    'qr_uid' => (string) Str::uuid(),
                    'printed_at' => now()->subDays($number % 60),
                ]);
            }

            $qrIdentities
                ->skip(1)
                ->each(fn (AssetQrIdentity $duplicate) => $duplicate->delete());

            $asset->forceFill([
                'qr_value' => implode('|', ['MESOCO', 'ASSET', 'v1', $qrIdentity->qr_uid]),
                'qr_code' => implode('|', ['MESOCO', 'ASSET', 'v1', $qrIdentity->qr_uid]),
            ])->save();

            return $asset->refresh();
        })->values();
    }

    private function statusForAsset(int $number): string
    {
        if ($number % 20 === 0) {
            return Asset::STATUS_RETIRED;
        }

        if ($number % 13 === 0) {
            return Asset::STATUS_OFF_SERVICE;
        }

        if ($number % 11 === 0) {
            return Asset::STATUS_MAINTENANCE;
        }

        return Asset::STATUS_ACTIVE;
    }

    private function configurationFor(string $category, int $number): string
    {
        return match ($category) {
            'Laptop' => ($number % 2 === 0 ? 'Intel i7, 16GB RAM, 512GB SSD' : 'Intel i5, 16GB RAM, 256GB SSD'),
            'Desktop' => 'Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro',
            'Monitor' => '27 inch, 4K, USB-C',
            'Network' => '24 ports, managed switch, VLAN ready',
            'Server' => 'Xeon Silver, 64GB RAM, RAID storage',
            'Printer' => 'Duplex, network print, monochrome laser',
            default => 'Cấu hình demo tiêu chuẩn cho tài sản IT.',
        };
    }

    /**
     * @param Collection<int, Asset> $assets
     * @param Collection<int, Employee> $employees
     */
    private function seedAssignments(Collection $assets, Collection $employees, User $manager): void
    {
        AssetAssignment::query()
            ->whereIn('asset_id', $assets->pluck('id'))
            ->whereNotNull('unassigned_at')
            ->delete();

        foreach ($assets as $index => $asset) {
            if ($asset->status !== Asset::STATUS_ACTIVE) {
                continue;
            }

            if (($index + 1) % 3 !== 0) {
                $employee = $employees[$index % $employees->count()];

                AssetAssignment::updateOrCreate(
                    ['asset_id' => $asset->id, 'unassigned_at' => null],
                    [
                        'employee_id' => $employee->id,
                        'department_name' => $employee->department,
                        'assigned_by' => $manager->id,
                        'assigned_at' => now()->subDays(5 + ($index % 35)),
                    ]
                );
            }

            if (($index + 1) % 5 === 0) {
                $historyEmployee = $employees[($index + 1) % $employees->count()];
                $historyAssignedAt = now()->startOfDay()->subDays(90 + ($index % 30));

                AssetAssignment::updateOrCreate(
                    [
                        'asset_id' => $asset->id,
                        'employee_id' => $historyEmployee->id,
                        'assigned_at' => $historyAssignedAt,
                    ],
                    [
                        'department_name' => null,
                        'assigned_by' => $manager->id,
                        'unassigned_at' => now()->startOfDay()->subDays(45 + ($index % 20)),
                    ]
                );
            }
        }
    }

    /**
     * @param Collection<int, Asset> $assets
     * @param Collection<int, Supplier> $suppliers
     */
    private function seedMaintenance(Collection $assets, Collection $suppliers, User $manager, User $technician): void
    {
        $issueSamples = [
            'Quạt tản nhiệt kêu lớn khi chạy nhiều ứng dụng.',
            'Pin tụt nhanh, cần kiểm tra chu kỳ sạc.',
            'Máy in kẹt giấy ở khay nạp chính.',
            'Switch có cổng mạng chập chờn.',
            'Ổ cứng báo cảnh báo dung lượng và hiệu năng.',
            'Màn hình nhấp nháy khi dùng cổng USB-C.',
        ];

        $actionSamples = [
            'Vệ sinh quạt và kiểm tra SSD.',
            'Cập nhật firmware và chạy chẩn đoán phần cứng.',
            'Thay dây nguồn, kiểm tra adapter và test tải.',
            'Làm sạch khay giấy, căn chỉnh lại cụm cuốn giấy.',
            'Kiểm tra log, thay cáp mạng và test lại VLAN.',
            'Sao lưu dữ liệu, kiểm tra SMART và lên lịch thay ổ.',
        ];

        foreach ($assets->take(45)->values() as $index => $asset) {
            $status = [MaintenanceEvent::STATUS_COMPLETED, MaintenanceEvent::STATUS_SCHEDULED, MaintenanceEvent::STATUS_IN_PROGRESS, MaintenanceEvent::STATUS_CANCELED][$index % 4];
            $plannedAt = now()->subDays(60 - $index)->setTime(9 + ($index % 8), 0);
            $startedAt = in_array($status, [MaintenanceEvent::STATUS_COMPLETED, MaintenanceEvent::STATUS_IN_PROGRESS], true)
                ? $plannedAt->copy()->addHours(1)
                : null;
            $completedAt = $status === MaintenanceEvent::STATUS_COMPLETED
                ? $plannedAt->copy()->addHours(3)
                : null;

            $event = MaintenanceEvent::updateOrCreate(
                ['code' => sprintf('DEMO-MNT-%03d', $index + 1)],
                [
                    'asset_id' => $asset->id,
                    'type' => MaintenanceEvent::TYPES[$index % count(MaintenanceEvent::TYPES)],
                    'status' => $status,
                    'planned_at' => $plannedAt,
                    'priority' => MaintenanceEvent::PRIORITIES[$index % count(MaintenanceEvent::PRIORITIES)],
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'note' => $issueSamples[$index % count($issueSamples)],
                    'result_note' => $completedAt ? $actionSamples[$index % count($actionSamples)] : null,
                    'estimated_duration_minutes' => 60 + (($index % 6) * 30),
                    'actual_duration_minutes' => $completedAt ? 55 + (($index % 5) * 25) : null,
                    'cost' => $completedAt ? 150000 + (($index % 8) * 120000) : null,
                    'assigned_to_user_id' => $technician->id,
                    'created_by' => $manager->id,
                    'updated_by' => $manager->id,
                ]
            );

            if ($status === MaintenanceEvent::STATUS_IN_PROGRESS) {
                $asset->update(['status' => Asset::STATUS_MAINTENANCE]);
            }

            if ($status !== MaintenanceEvent::STATUS_SCHEDULED) {
                $repairData = [
                    'technician_user_id' => $technician->id,
                    'supplier_id' => $suppliers[$index % $suppliers->count()]->id,
                    'status' => $status,
                    'issue_description' => $issueSamples[$index % count($issueSamples)],
                    'action_taken' => $status === MaintenanceEvent::STATUS_COMPLETED ? $actionSamples[$index % count($actionSamples)] : null,
                    'cost' => $status === MaintenanceEvent::STATUS_COMPLETED ? 120000 + (($index % 7) * 90000) : null,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'logged_at' => $completedAt ?? $startedAt ?? now(),
                ];

                MaintenanceDetail::updateOrCreate(
                    ['maintenance_event_id' => $event->id, 'asset_id' => $asset->id],
                    ['qty' => 1] + $repairData
                );

                RepairLog::updateOrCreate(
                    ['maintenance_event_id' => $event->id, 'asset_id' => $asset->id],
                    $repairData
                );
            }
        }
    }

    /**
     * @param Collection<int, Asset> $assets
     * @param Collection<int, Employee> $employees
     */
    private function seedRequests(Collection $assets, Collection $employees, User $manager, User $technician): void
    {
        if (!Schema::hasTable('requests') || !Schema::hasTable('request_items') || !Schema::hasTable('request_events')) {
            return;
        }

        $statuses = AssetRequest::STATUSES;
        $consumables = [
            ['sku' => 'TONER-HP-85A', 'name' => 'Mực in HP 85A', 'unit' => 'hộp'],
            ['sku' => 'MOUSE-WL-01', 'name' => 'Chuột không dây', 'unit' => 'cái'],
            ['sku' => 'KB-VN-01', 'name' => 'Bàn phím văn phòng', 'unit' => 'cái'],
            ['sku' => 'LAN-CAT6-03M', 'name' => 'Dây mạng Cat6 3m', 'unit' => 'sợi'],
            ['sku' => 'SSD-512-SATA', 'name' => 'Ổ cứng SSD 512GB', 'unit' => 'cái'],
        ];

        foreach (range(1, 30) as $number) {
            $type = $number % 2 === 0 ? AssetRequest::TYPE_CONSUMABLE_REQUEST : AssetRequest::TYPE_JUSTIFICATION;
            $status = $statuses[($number - 1) % count($statuses)];
            $asset = $assets[($number * 2) % $assets->count()];
            $requester = $employees[($number - 1) % $employees->count()];

            $request = AssetRequest::updateOrCreate(
                ['code' => sprintf('DEMO-REQ-%03d', $number)],
                [
                    'type' => $type,
                    'status' => $status,
                    'requested_by_employee_id' => $requester->id,
                    'asset_id' => $type === AssetRequest::TYPE_JUSTIFICATION ? $asset->id : null,
                    'reviewed_by_user_id' => in_array($status, [AssetRequest::STATUS_APPROVED, AssetRequest::STATUS_REJECTED], true) ? $manager->id : null,
                    'assigned_to_user_id' => $status === AssetRequest::STATUS_APPROVED ? $technician->id : null,
                    'reviewed_at' => in_array($status, [AssetRequest::STATUS_APPROVED, AssetRequest::STATUS_REJECTED], true) ? now()->subDays($number % 12) : null,
                    'review_note' => $status === AssetRequest::STATUS_REJECTED ? 'Chưa đủ thông tin để duyệt yêu cầu.' : null,
                    'title' => $type === AssetRequest::TYPE_JUSTIFICATION
                        ? 'Báo sự cố tài sản ' . $asset->asset_code
                        : 'Yêu cầu cấp vật tư IT tháng ' . (($number % 12) + 1),
                    'description' => $type === AssetRequest::TYPE_JUSTIFICATION
                        ? 'Thiết bị có dấu hiệu hoạt động không ổn định, cần kỹ thuật kiểm tra.'
                        : 'Nhân viên cần bổ sung vật tư phục vụ công việc hằng ngày.',
                    'severity' => AssetRequest::SEVERITIES[$number % count(AssetRequest::SEVERITIES)],
                    'incident_at' => $type === AssetRequest::TYPE_JUSTIFICATION ? now()->subDays($number % 20 + 1) : null,
                    'suspected_cause' => $type === AssetRequest::TYPE_JUSTIFICATION
                        ? AssetRequest::SUSPECTED_CAUSES[$number % count(AssetRequest::SUSPECTED_CAUSES)]
                        : null,
                ]
            );

            if ($type === AssetRequest::TYPE_JUSTIFICATION) {
                RequestItem::updateOrCreate(
                    ['request_id' => $request->id, 'item_kind' => RequestItem::KIND_ASSET],
                    [
                        'asset_id' => $asset->id,
                        'qty' => 1,
                        'unit' => 'tài sản',
                        'note' => 'Kiểm tra tài sản liên quan đến phiếu yêu cầu.',
                    ]
                );
            } else {
                $item = $consumables[$number % count($consumables)];

                RequestItem::updateOrCreate(
                    ['request_id' => $request->id, 'item_kind' => RequestItem::KIND_CONSUMABLE],
                    [
                        'sku' => $item['sku'],
                        'name' => $item['name'],
                        'qty' => ($number % 4) + 1,
                        'unit' => $item['unit'],
                        'note' => 'Vật tư demo cho luồng phiếu yêu cầu.',
                    ]
                );
            }

            RequestEvent::updateOrCreate(
                ['request_id' => $request->id, 'event_type' => RequestEvent::TYPE_CREATED],
                ['actor_user_id' => $requester->user?->id, 'meta' => ['seed' => 'feature_demo'], 'created_at' => now()->subDays($number + 2)]
            );

            if ($status !== AssetRequest::STATUS_SUBMITTED) {
                RequestEvent::updateOrCreate(
                    ['request_id' => $request->id, 'event_type' => $this->eventTypeForRequestStatus($status)],
                    ['actor_user_id' => $manager->id, 'meta' => ['seed' => 'feature_demo'], 'created_at' => now()->subDays($number)]
                );
            }
        }
    }

    private function eventTypeForRequestStatus(string $status): string
    {
        return match ($status) {
            AssetRequest::STATUS_APPROVED => RequestEvent::TYPE_APPROVED,
            AssetRequest::STATUS_REJECTED => RequestEvent::TYPE_REJECTED,
            AssetRequest::STATUS_CANCELLED => RequestEvent::TYPE_CANCELLED,
            default => RequestEvent::TYPE_SUBMITTED,
        };
    }

    /**
     * @param Collection<int, Asset> $assets
     * @param Collection<int, User> $users
     */
    private function seedFeedbacks(Collection $assets, Collection $users, User $manager): void
    {
        $contents = [
            'Giao diện xem QR dễ dùng hơn sau khi có dữ liệu đầy đủ.',
            'Thiết bị phản hồi chậm, cần kiểm tra thêm.',
            'Nên bổ sung nhắc lịch bảo trì cho laptop dùng lâu.',
            'Thông tin vị trí và người phụ trách đã rõ ràng.',
            'Phiếu yêu cầu vật tư giúp theo dõi tốt hơn.',
        ];

        foreach (range(1, 20) as $number) {
            $status = Feedback::STATUSES[($number - 1) % count(Feedback::STATUSES)];

            Feedback::updateOrCreate(
                ['code' => sprintf('DEMO-FB-%03d', $number)],
                [
                    'user_id' => $users[($number - 1) % $users->count()]->id,
                    'asset_id' => $assets[($number * 3) % $assets->count()]->id,
                    'maintenance_event_id' => null,
                    'content' => $contents[$number % count($contents)],
                    'rating' => ($number % 5) + 1,
                    'status' => $status,
                    'type' => Feedback::TYPES[$number % count(Feedback::TYPES)],
                    'response' => $status === Feedback::STATUS_RESOLVED ? 'Đã ghi nhận và xử lý theo quy trình IT.' : null,
                    'resolved_by' => $status === Feedback::STATUS_RESOLVED ? $manager->id : null,
                    'resolved_at' => $status === Feedback::STATUS_RESOLVED ? now()->subDays($number % 10) : null,
                ]
            );
        }
    }

    /**
     * @param Collection<int, Asset> $assets
     * @param Collection<int, Supplier> $suppliers
     */
    private function seedPurchaseOrders(Collection $assets, Collection $suppliers, User $manager): void
    {
        PurchaseOrderItem::query()
            ->whereHas('purchaseOrder', fn ($query) => $query->where('order_code', 'like', 'DEMO-PO-%'))
            ->delete();

        $paymentMethods = ['Chuyển khoản', 'COD', 'Công nợ 30 ngày', 'Công nợ 45 ngày'];
        $notes = [
            'Bổ sung laptop và phụ kiện cho nhân viên mới.',
            'Thay thế thiết bị mạng đã gần hết vòng đời.',
            'Mua vật tư dự phòng cho kho IT.',
            'Trang bị thiết bị phòng họp và khu lễ tân.',
        ];

        foreach (range(1, self::PURCHASE_ORDER_COUNT) as $number) {
            $supplier = $suppliers[($number - 1) % $suppliers->count()];
            $status = PurchaseOrder::STATUSES[($number - 1) % count(PurchaseOrder::STATUSES)];
            $order = PurchaseOrder::updateOrCreate(
                ['order_code' => sprintf('DEMO-PO-%03d', $number)],
                [
                    'supplier_id' => $supplier->id,
                    'requested_by_user_id' => $manager->id,
                    'approved_by_user_id' => $number % 3 === 0 ? $manager->id : null,
                    'order_date' => now()->subDays($number * 4)->toDateString(),
                    'expected_delivery_date' => now()->addDays(5 + $number)->toDateString(),
                    'status' => $status,
                    'total_amount' => 0,
                    'payment_method' => $paymentMethods[($number - 1) % count($paymentMethods)],
                    'note' => $notes[($number - 1) % count($notes)],
                ]
            );

            $total = 0;
            foreach (range(1, 4) as $line) {
                $asset = $assets[(($number * 4) + $line) % $assets->count()];
                $qty = $line === 1 ? 1 : (($line + $number) % 4) + 1;
                $unitPrice = 650000 + (($number + $line) * 280000);
                $lineTotal = $qty * $unitPrice;
                $total += $lineTotal;

                PurchaseOrderItem::updateOrCreate(
                    ['purchase_order_id' => $order->id, 'item_name' => $this->purchaseOrderItemName($asset, $line)],
                    [
                        'asset_id' => $line === 1 ? $asset->id : null,
                        'category_id' => $asset->category_id,
                        'qty' => $qty,
                        'unit' => $line === 1 ? 'cái' : ($line === 4 ? 'gói' : 'bộ'),
                        'unit_price' => $unitPrice,
                        'line_total' => $lineTotal,
                        'note' => 'Dòng hàng demo cho kiểm thử purchase order.',
                    ]
                );
            }

            $order->update(['total_amount' => $total]);
        }
    }

    private function purchaseOrderItemName(Asset $asset, int $line): string
    {
        return match ($line) {
            1 => $asset->name,
            2 => $asset->category . ' - phụ kiện thay thế',
            3 => $asset->category . ' - dịch vụ cài đặt',
            default => $asset->category . ' - vật tư dự phòng',
        };
    }

    /**
     * @param Collection<int, Asset> $assets
     */
    private function seedInventoryChecks(Collection $assets, User $manager, User $technician): void
    {
        InventoryCheckItem::query()
            ->whereHas('inventoryCheck', fn ($query) => $query->where('code', 'like', 'DEMO-INV-%'))
            ->delete();

        foreach (range(1, self::INVENTORY_CHECK_COUNT) as $number) {
            $status = InventoryCheck::STATUSES[($number - 1) % count(InventoryCheck::STATUSES)];
            $check = InventoryCheck::updateOrCreate(
                ['code' => sprintf('DEMO-INV-%03d', $number)],
                [
                    'title' => 'Kiểm kê demo đợt ' . $number,
                    'check_date' => now()->subDays($number * 7)->toDateString(),
                    'status' => $status,
                    'created_by_user_id' => $manager->id,
                    'completed_by_user_id' => $status === InventoryCheck::STATUS_COMPLETED ? $technician->id : null,
                    'completed_at' => $status === InventoryCheck::STATUS_COMPLETED ? now()->subDays($number * 3) : null,
                    'location' => 'Khu kiểm kê demo ' . $number,
                    'note' => 'Dữ liệu kiểm kê demo có đủ matched, missing, damaged, moved và pending.',
                ]
            );

            foreach (range(0, 11) as $index) {
                $asset = $assets[(($number - 1) * 10 + $index) % $assets->count()];
                $result = InventoryCheckItem::RESULTS[($index + $number) % count(InventoryCheckItem::RESULTS)];
                $actualLocation = $result === InventoryCheckItem::RESULT_MOVED
                    ? 'Vị trí phát sinh trong kiểm kê'
                    : $asset->location;

                InventoryCheckItem::updateOrCreate(
                    ['inventory_check_id' => $check->id, 'asset_id' => $asset->id],
                    [
                        'expected_status' => $asset->status,
                        'actual_status' => $result === InventoryCheckItem::RESULT_DAMAGED ? Asset::STATUS_MAINTENANCE : $asset->status,
                        'expected_location' => $asset->location,
                        'actual_location' => $actualLocation,
                        'result' => $result,
                        'condition_note' => $result === InventoryCheckItem::RESULT_DAMAGED ? 'Có dấu hiệu hư hỏng, cần tạo lịch bảo trì.' : null,
                        'counted_by_user_id' => $technician->id,
                        'checked_at' => $status === InventoryCheck::STATUS_IN_PROGRESS ? null : now()->subDays($number),
                        'note' => 'Dòng kiểm kê demo cho tài sản ' . $asset->asset_code,
                    ]
                );
            }
        }
    }

    /**
     * @param Collection<int, Asset> $assets
     */
    private function seedDisposals(Collection $assets, User $manager): void
    {
        $assets->where('status', Asset::STATUS_RETIRED)->values()->each(function (Asset $asset, int $index) use ($manager) {
            $bookValue = $asset->getCurrentBookValue() ?? 0;
            $proceeds = round($bookValue * 0.2, 2);

            $disposal = Disposal::updateOrCreate(
                ['code' => sprintf('DEMO-DSP-%03d', $index + 1)],
                [
                    'asset_id' => $asset->id,
                    'method' => Disposal::METHODS[$index % count(Disposal::METHODS)],
                    'reason' => 'Tài sản đã hết vòng đời sử dụng hoặc chi phí sửa chữa không còn hợp lý.',
                    'disposed_by_user_id' => $manager->id,
                    'approved_by_user_id' => $manager->id,
                    'disposed_at' => now()->subDays(20 + $index),
                    'asset_book_value' => $bookValue,
                    'proceeds_amount' => $proceeds,
                    'note' => 'Dữ liệu thanh lý demo; tài sản retired không còn gắn vị trí.',
                ]
            );

            DisposalDetail::updateOrCreate(
                ['disposal_id' => $disposal->id, 'asset_id' => $asset->id],
                [
                    'condition_summary' => 'Hao mòn cao, không còn phù hợp vận hành.',
                    'asset_book_value' => $bookValue,
                    'proceeds_amount' => $proceeds,
                    'processed_at' => now()->subDays(19 + $index),
                    'note' => 'Chi tiết thanh lý demo.',
                ]
            );
        });
    }
}
