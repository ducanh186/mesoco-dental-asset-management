<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quet QR tai san - {{ $asset['name'] }}</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f7fbff;
            --surface: #ffffff;
            --surface-soft: #eef7ff;
            --text: #10243d;
            --muted: #5f7187;
            --border: #d8e7f7;
            --primary: #1f67a7;
            --primary-dark: #154d84;
            --primary-soft: #d9ecfb;
            --accent: #f5822a;
            --warning: #b76116;
            --danger: #b42318;
            --success: #087443;
            --shadow: 0 16px 42px rgb(15 39 66 / 0.12);
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            color: var(--text);
            background: var(--bg);
        }

        .top-band {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
        }

        .shell {
            width: min(1120px, calc(100% - 32px));
            margin: 0 auto;
        }

        .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-height: 76px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;
        }

        .brand img {
            width: 138px;
            height: auto;
            object-fit: contain;
        }

        .brand-copy {
            display: grid;
            gap: 2px;
            min-width: 0;
        }

        .brand-title {
            margin: 0;
            font-size: 15px;
            font-weight: 800;
            color: var(--primary-dark);
        }

        .brand-subtitle {
            margin: 0;
            color: var(--muted);
            font-size: 13px;
        }

        .role-chip,
        .status-chip,
        .action-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            min-height: 30px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 800;
            color: var(--primary-dark);
            background: var(--primary-soft);
            border: 1px solid #bfddf6;
            white-space: nowrap;
        }

        .status-chip.warning {
            color: var(--warning);
            background: #fff4e8;
            border-color: #ffd2a8;
        }

        .status-chip.danger {
            color: var(--danger);
            background: #fff1f0;
            border-color: #ffd5d1;
        }

        .page-header {
            padding: 28px 0 18px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 20px;
            align-items: start;
        }

        .page-title {
            margin: 0 0 8px;
            font-size: clamp(30px, 4vw, 44px);
            line-height: 1.05;
            letter-spacing: 0;
            color: var(--text);
        }

        .page-summary {
            margin: 0;
            max-width: 720px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.55;
        }

        .header-meta {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 10px;
        }

        .grid {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
            gap: 16px;
            padding-bottom: 42px;
        }

        .panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: var(--shadow);
            padding: 18px;
        }

        .panel + .panel {
            margin-top: 16px;
        }

        .panel-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
        }

        .panel-title h2 {
            margin: 0;
            color: var(--primary-dark);
            font-size: 17px;
            line-height: 1.25;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
        }

        .info-row {
            min-width: 0;
        }

        .label {
            margin-bottom: 5px;
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
        }

        .value {
            min-height: 22px;
            color: var(--text);
            font-size: 15px;
            font-weight: 700;
            line-height: 1.45;
            overflow-wrap: anywhere;
        }

        .muted {
            color: var(--muted);
            font-weight: 600;
        }

        .qr-box {
            border-radius: 8px;
            border: 1px dashed #9fc7ea;
            background: var(--surface-soft);
            padding: 14px;
            color: var(--primary-dark);
            font-family: "Cascadia Code", Consolas, monospace;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
        }

        .action-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .repair-list {
            display: grid;
            gap: 10px;
        }

        .repair-item {
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px;
            background: #fbfdff;
        }

        .repair-item strong {
            display: block;
            margin-bottom: 4px;
            color: var(--primary-dark);
        }

        .footer {
            padding: 0 0 28px;
            color: var(--muted);
            font-size: 13px;
        }

        a {
            color: var(--primary);
            font-weight: 800;
            text-decoration: none;
        }

        a:hover {
            color: var(--primary-dark);
            text-decoration: underline;
        }

        @media (max-width: 860px) {
            .topbar,
            .page-header {
                grid-template-columns: 1fr;
            }

            .topbar {
                align-items: flex-start;
                padding: 14px 0;
            }

            .header-meta {
                justify-content: flex-start;
            }

            .grid,
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
@php
    $lifecycleStatus = $asset['lifecycle_status'] ?? $asset['status'];
    $statusClass = in_array($lifecycleStatus, ['Repairing'], true)
        ? 'warning'
        : (in_array($lifecycleStatus, ['Disposed'], true) ? 'danger' : '');
    $responsiblePerson = $asset['responsible_employee']['full_name'] ?? 'Chưa có người đang sở hữu';
    $visibilityRole = $asset['visibility']['role'] ?? 'public';
    $roleLabels = [
        'public' => 'Khách xem QR',
        'employee' => 'Nhân viên',
        'technician' => 'Kỹ thuật viên',
        'manager' => 'Quản lý',
    ];
    $actionLabels = [
        'view_basic' => 'Xem thông tin cơ bản',
        'report_issue' => 'Báo sự cố',
        'view_technical' => 'Xem kỹ thuật',
        'open_maintenance' => 'Mở bảo trì/sửa chữa',
        'inventory_check' => 'Kiểm kê',
        'view_supplier' => 'Xem nhà cung cấp',
        'regenerate_qr' => 'Tạo lại QR',
        'review_disposal' => 'Duyệt đề xuất thu hủy',
    ];
    $technical = $asset['technical'] ?? null;
    $supplier = $asset['supplier'] ?? null;
    $repairLogs = $technical['repair_logs'] ?? [];
    $warrantyStatus = $asset['warranty_status']['status'] ?? 'unknown';
    $warrantyLabel = match ($warrantyStatus) {
        'active' => 'Còn bảo hành',
        'expired' => 'Hết bảo hành',
        default => 'Chưa có ngày hết hạn bảo hành',
    };
    $viteHotFile = public_path('hot');
    $viteOrigin = file_exists($viteHotFile) ? rtrim(trim(file_get_contents($viteHotFile)), '/') : null;
    $logoUrl = $viteOrigin ? "{$viteOrigin}/images/mesoco_logo.png" : '/images/mesoco_logo.png';
@endphp

<div class="top-band">
    <div class="shell topbar">
        <div class="brand">
            <img src="{{ $logoUrl }}" alt="Mesoco">
            <div class="brand-copy">
                <p class="brand-title">Quản lý thiết bị IT tại Mesoco</p>
                <p class="brand-subtitle">Cổng tra cứu thiết bị bằng mã QR</p>
            </div>
        </div>
        <span class="role-chip">{{ $roleLabels[$visibilityRole] ?? $visibilityRole }}</span>
    </div>
</div>

<main class="shell">
    <header class="page-header">
        <div>
            <h1 class="page-title">{{ $asset['name'] }}</h1>
            <p class="page-summary">
                Mã QR này trả dữ liệu theo quyền hiện tại: nhân viên xem thông tin cơ bản,
                kỹ thuật viên xem thêm bảo trì/sửa chữa và khấu hao, quản lý xem thêm nguồn gốc nhà cung cấp.
            </p>
        </div>
        <div class="header-meta">
            <span class="status-chip {{ $statusClass }}">{{ $lifecycleStatus }}</span>
            <span class="status-chip">{{ $warrantyLabel }}</span>
        </div>
    </header>

    <section class="grid">
        <div>
            <article class="panel">
                <div class="panel-title">
                    <h2>Thông tin thiết bị</h2>
                </div>
                <div class="info-grid">
                    <div class="info-row">
                        <div class="label">Mã thiết bị</div>
                        <div class="value">{{ $asset['asset_code'] ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Số serial</div>
                        <div class="value">{{ $asset['serial_number'] ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Model</div>
                        <div class="value">{{ $asset['model'] ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Người đang sở hữu</div>
                        <div class="value">{{ $responsiblePerson }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Vị trí</div>
                        <div class="value">{{ $asset['location_name'] ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Hạn bảo hành</div>
                        <div class="value">{{ $asset['warranty_expiry'] ?? 'N/A' }}</div>
                    </div>
                </div>
                <div class="info-row" style="margin-top: 14px;">
                    <div class="label">Cấu hình</div>
                    <div class="value">{{ $asset['configuration'] ?? 'Chưa ghi nhận cấu hình.' }}</div>
                </div>
            </article>

            @if ($technical)
                <article class="panel">
                    <div class="panel-title">
                        <h2>Bảo trì/Sửa chữa và khấu hao</h2>
                    </div>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="label">Lần bảo trì cuối</div>
                            <div class="value">{{ $technical['last_maintenance_date'] ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Tình trạng thiết bị</div>
                            <div class="value">{{ $technical['device_status'] ?? $lifecycleStatus }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Mức độ khấu hao</div>
                            <div class="value">{{ $technical['current_depreciation_rate'] ?? 'N/A' }}%</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Giá trị còn lại</div>
                            <div class="value">{{ isset($technical['remaining_value']) ? number_format((float) $technical['remaining_value'], 0, ',', '.') . ' VND' : 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Sự cố gần nhất</div>
                            <div class="value">{{ $technical['last_issue_note'] ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Xử lý gần nhất</div>
                            <div class="value">{{ $technical['last_action_taken'] ?? 'N/A' }}</div>
                        </div>
                    </div>

                    <div style="margin-top: 16px;">
                        <div class="label">Nhật ký sửa chữa</div>
                        <div class="repair-list">
                            @forelse ($repairLogs as $log)
                                <div class="repair-item">
                                    <strong>{{ $log['issue_description'] ?? 'Sự cố chưa ghi mô tả' }}</strong>
                                    <div class="muted">{{ $log['action_taken'] ?? 'Chưa có hướng xử lý' }}</div>
                                </div>
                            @empty
                                <div class="value muted">Chưa có nhật ký sửa chữa.</div>
                            @endforelse
                        </div>
                    </div>
                </article>
            @endif

            @if ($supplier)
                <article class="panel">
                    <div class="panel-title">
                        <h2>Nguồn gốc và nhà cung cấp</h2>
                    </div>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="label">Nhà cung cấp</div>
                            <div class="value">{{ $supplier['name'] ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Liên hệ</div>
                            <div class="value">{{ $supplier['phone'] ?? $supplier['email'] ?? $supplier['contact_person'] ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Ngày mua</div>
                            <div class="value">{{ $asset['purchase_date'] ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="label">Giá mua</div>
                            <div class="value">{{ isset($asset['purchase_price']) ? number_format((float) $asset['purchase_price'], 0, ',', '.') . ' VND' : 'N/A' }}</div>
                        </div>
                    </div>
                </article>
            @endif
        </div>

        <aside>
            <article class="panel">
                <div class="panel-title">
                    <h2>Mã QR</h2>
                </div>
                <div class="label">Payload</div>
                <div class="qr-box">{{ $asset['qr']['payload'] ?? $asset['qr_code'] ?? 'Chưa có QR payload' }}</div>
                <div class="info-grid" style="grid-template-columns: 1fr; margin-top: 14px;">
                    <div class="info-row">
                        <div class="label">QR UID</div>
                        <div class="value">{{ $asset['qr']['uid'] ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Portal URL</div>
                        <div class="value"><a href="{{ $portalUrl }}">{{ $portalUrl }}</a></div>
                    </div>
                    <div class="info-row">
                        <div class="label">Thời điểm tra cứu</div>
                        <div class="value">{{ $resolvedAt }}</div>
                    </div>
                </div>
            </article>

            <article class="panel">
                <div class="panel-title">
                    <h2>Quyền thao tác</h2>
                </div>
                <div class="action-list">
                    @foreach (($asset['available_actions'] ?? ['view_basic']) as $action)
                        <span class="action-chip">{{ $actionLabels[$action] ?? $action }}</span>
                    @endforeach
                </div>
            </article>
        </aside>
    </section>

    <footer class="footer">
        Dữ liệu được lấy từ cổng View_AssetPortal_Full chuyển tiếp để phục vụ quét QR và phân quyền.
    </footer>
</main>
</body>
</html>
