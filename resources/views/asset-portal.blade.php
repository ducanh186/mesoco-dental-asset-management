<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asset Portal - {{ $asset['name'] }}</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f4efe6;
            --panel: rgba(255, 255, 255, 0.88);
            --panel-strong: #ffffff;
            --text: #1f1b16;
            --muted: #6d6458;
            --border: rgba(102, 78, 53, 0.12);
            --accent: #0c6b58;
            --accent-soft: rgba(12, 107, 88, 0.12);
            --warning: #9c4f19;
            --danger: #8d2f22;
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", "Helvetica Neue", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at top right, rgba(12, 107, 88, 0.16), transparent 28%),
                radial-gradient(circle at bottom left, rgba(156, 79, 25, 0.18), transparent 30%),
                linear-gradient(145deg, #f7f2ea 0%, #f0e4d6 100%);
        }
        .shell {
            max-width: 1120px;
            margin: 0 auto;
            padding: 32px 20px 48px;
        }
        .hero {
            background: var(--panel);
            backdrop-filter: blur(18px);
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 28px;
            box-shadow: 0 24px 80px rgba(60, 42, 19, 0.12);
        }
        .hero-top {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: space-between;
            align-items: flex-start;
        }
        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.72);
            color: var(--muted);
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        h1 {
            margin: 16px 0 8px;
            font-size: clamp(32px, 5vw, 52px);
            line-height: 0.96;
            letter-spacing: -0.04em;
        }
        .summary {
            margin: 0;
            color: var(--muted);
            font-size: 15px;
            max-width: 620px;
        }
        .pill {
            display: inline-flex;
            align-items: center;
            padding: 10px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            background: var(--accent-soft);
            color: var(--accent);
        }
        .pill.warning {
            background: rgba(156, 79, 25, 0.12);
            color: var(--warning);
        }
        .pill.danger {
            background: rgba(141, 47, 34, 0.12);
            color: var(--danger);
        }
        .hero-grid {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 18px;
            margin-top: 24px;
        }
        .panel {
            background: var(--panel-strong);
            border: 1px solid var(--border);
            border-radius: 22px;
            padding: 20px;
        }
        .panel.main { grid-column: span 8; }
        .panel.side { grid-column: span 4; }
        .label {
            color: var(--muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
        }
        .value {
            font-size: 16px;
            font-weight: 600;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
        }
        .stack { display: grid; gap: 16px; }
        .qr-box {
            padding: 16px;
            border-radius: 18px;
            background: #fcf9f4;
            border: 1px dashed rgba(102, 78, 53, 0.24);
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 13px;
            line-height: 1.5;
            word-break: break-all;
        }
        .meta-list {
            display: grid;
            gap: 14px;
        }
        .meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .footer {
            margin-top: 16px;
            color: var(--muted);
            font-size: 13px;
        }
        a.link {
            color: var(--accent);
            text-decoration: none;
            font-weight: 700;
        }
        @media (max-width: 860px) {
            .panel.main,
            .panel.side {
                grid-column: span 12;
            }
            .metric-grid {
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
    $responsiblePerson = $asset['responsible_employee']['full_name'] ?? 'Chua co nguoi phu trach';
    $visibilityRole = $asset['visibility']['role'] ?? 'public';
    $technical = $asset['technical'] ?? null;
    $supplier = $asset['supplier'] ?? null;
@endphp
<div class="shell">
    <section class="hero">
        <div class="hero-top">
            <div>
                <div class="eyebrow">Mesoco Asset Portal</div>
                <h1>{{ $asset['name'] }}</h1>
                <p class="summary">
                    Portal read-only cho QR asset. Noi dung duoc cat theo role hien tai:
                    employee thay thong tin co ban, technician thay them ky thuat, manager thay them nguon goc NCC.
                </p>
            </div>
            <div class="stack">
                <div class="pill {{ $statusClass }}">{{ $lifecycleStatus }}</div>
                <div class="pill">Role: {{ $visibilityRole }}</div>
            </div>
        </div>

        <div class="hero-grid">
            <div class="panel main stack">
                <div class="metric-grid">
                    <div>
                        <div class="label">Asset Code</div>
                        <div class="value">{{ $asset['asset_code'] ?? 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="label">Serial Number</div>
                        <div class="value">{{ $asset['serial_number'] ?? 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="label">Model</div>
                        <div class="value">{{ $asset['model'] ?? 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="label">Responsible Person</div>
                        <div class="value">{{ $responsiblePerson }}</div>
                    </div>
                    <div>
                        <div class="label">Location</div>
                        <div class="value">{{ $asset['location_name'] ?? 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="label">Warranty Expiry</div>
                        <div class="value">{{ $asset['warranty_expiry'] ?? 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="label">Warranty Status</div>
                        <div class="value">{{ $asset['warranty_status']['label'] ?? 'N/A' }}</div>
                    </div>
                </div>

                <div>
                    <div class="label">Configuration</div>
                    <div class="value">{{ $asset['configuration'] ?? 'No configuration captured yet.' }}</div>
                </div>

                @if ($technical)
                    <div class="metric-grid">
                        <div>
                            <div class="label">Last Maintenance</div>
                            <div class="value">{{ $technical['last_maintenance_date'] ?? 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Depreciation Rate</div>
                            <div class="value">{{ $technical['current_depreciation_rate'] ?? 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Remaining Value</div>
                            <div class="value">{{ isset($technical['remaining_value']) ? number_format((float) $technical['remaining_value'], 0, ',', '.') . ' VND' : 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Last Issue</div>
                            <div class="value">{{ $technical['last_issue_note'] ?? 'N/A' }}</div>
                        </div>
                    </div>
                @endif

                @if ($supplier)
                    <div class="metric-grid">
                        <div>
                            <div class="label">Purchase Price</div>
                            <div class="value">{{ isset($asset['purchase_price']) ? number_format((float) $asset['purchase_price'], 0, ',', '.') . ' VND' : 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Purchase Date</div>
                            <div class="value">{{ $asset['purchase_date'] ?? 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Supplier</div>
                            <div class="value">{{ $supplier['name'] ?? 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="label">Supplier Contact</div>
                            <div class="value">{{ $supplier['phone'] ?? $supplier['email'] ?? 'N/A' }}</div>
                        </div>
                    </div>
                @endif
            </div>

            <div class="panel side stack">
                <div>
                    <div class="label">QR Payload</div>
                    <div class="qr-box">{{ $asset['qr']['payload'] ?? $asset['qr_code'] ?? 'No QR payload' }}</div>
                </div>

                <div class="meta-list">
                    <div class="meta-item">
                        <div class="label">QR UID</div>
                        <div class="value">{{ $asset['qr']['uid'] ?? 'N/A' }}</div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Printed At</div>
                        <div class="value">{{ $asset['qr']['printed_at'] ?? 'N/A' }}</div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Portal URL</div>
                        <div class="value"><a class="link" href="{{ $portalUrl }}">{{ $portalUrl }}</a></div>
                    </div>
                    <div class="meta-item">
                        <div class="label">Resolved At</div>
                        <div class="value">{{ $resolvedAt }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            View_AssetPortal_Full transitional surface. Legacy QR scanner workflows remain replaced by this read-only asset portal.
        </div>
    </section>
</div>
</body>
</html>
