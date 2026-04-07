<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->after('role')
                ->constrained('roles')
                ->nullOnDelete();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('department', 100)->nullable()->after('position');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('category_id')
                ->nullable()
                ->after('category')
                ->constrained('categories')
                ->nullOnDelete();
            $table->foreignId('supplier_id')
                ->nullable()
                ->after('category_id')
                ->constrained('suppliers')
                ->nullOnDelete();
            $table->unsignedInteger('warranty_period_months')->nullable()->after('warranty_expiry');
            $table->decimal('depreciation_rate', 8, 4)->nullable()->after('depreciation_method');
            $table->string('qr_value')->nullable()->after('instructions_url');
            $table->string('qr_image_path')->nullable()->after('qr_value');
        });

        Schema::table('requests', function (Blueprint $table) {
            $table->foreignId('asset_id')
                ->nullable()
                ->after('requested_by_employee_id')
                ->constrained('assets')
                ->nullOnDelete();
            $table->foreignId('assigned_to_user_id')
                ->nullable()
                ->after('reviewed_by_user_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        Schema::table('maintenance_events', function (Blueprint $table) {
            $table->foreignId('assigned_to_user_id')
                ->nullable()
                ->after('assigned_to')
                ->constrained('users')
                ->nullOnDelete();
        });

        $this->backfillRoles();
        $this->backfillDepartments();
        $this->backfillCategories();
        $this->backfillAssetDerivedFields();
        $this->backfillRequestPrimaryAsset();
        $this->backfillMaintenanceAssignments();
        $this->backfillLegacyRetiredAssets();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_events', function (Blueprint $table) {
            $table->dropForeign(['assigned_to_user_id']);
            $table->dropColumn('assigned_to_user_id');
        });

        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['asset_id']);
            $table->dropForeign(['assigned_to_user_id']);
            $table->dropColumn(['asset_id', 'assigned_to_user_id']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'category_id',
                'supplier_id',
                'warranty_period_months',
                'depreciation_rate',
                'qr_value',
                'qr_image_path',
            ]);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('department');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }

    private function backfillRoles(): void
    {
        $now = now();
        $roleIds = DB::table('roles')->pluck('id', 'code');

        $distinctRoles = DB::table('users')
            ->select('role')
            ->whereNotNull('role')
            ->distinct()
            ->pluck('role');

        foreach ($distinctRoles as $role) {
            $normalizedRole = match ($role) {
                'admin' => 'manager',
                'hr' => 'technician',
                'staff', null, '' => 'employee',
                default => $role,
            };

            if (!isset($roleIds[$normalizedRole])) {
                DB::table('roles')->insert([
                    'code' => $normalizedRole,
                    'name' => Str::headline($normalizedRole),
                    'description' => null,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $roleIds = DB::table('roles')->pluck('id', 'code');
            }
        }

        foreach (DB::table('users')->select('id', 'role')->get() as $user) {
            $normalizedRole = match ($user->role) {
                'admin' => 'manager',
                'hr' => 'technician',
                'staff', null, '' => 'employee',
                default => $user->role,
            };

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'role' => $normalizedRole,
                    'role_id' => $roleIds[$normalizedRole] ?? null,
                ]);
        }
    }

    private function backfillDepartments(): void
    {
        $userByEmployeeId = DB::table('users')
            ->whereNotNull('employee_id')
            ->pluck('role', 'employee_id');

        foreach (DB::table('employees')->select('id', 'position')->get() as $employee) {
            $role = $userByEmployeeId[$employee->id] ?? null;
            $position = Str::lower((string) $employee->position);

            $department = match (true) {
                $role === 'manager', str_contains($position, 'admin'), str_contains($position, 'manager'), str_contains($position, 'quản lý') => 'management',
                $role === 'technician', str_contains($position, 'human'), str_contains($position, 'nhân sự'), str_contains($position, 'technician'), str_contains($position, 'kỹ thuật') => 'technical',
                $role === 'doctor', str_contains($position, 'dentist'), str_contains($position, 'bác sĩ') => 'clinical',
                default => 'operations',
            };

            DB::table('employees')
                ->where('id', $employee->id)
                ->update(['department' => $department]);
        }
    }

    private function backfillCategories(): void
    {
        $now = now();
        $assetCategories = DB::table('assets')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        foreach ($assetCategories as $name) {
            DB::table('categories')->updateOrInsert(
                ['code' => Str::slug($name, '_')],
                [
                    'name' => $name,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $categoryIds = DB::table('categories')->pluck('id', 'name');

        foreach (DB::table('assets')->select('id', 'category')->whereNotNull('category')->get() as $asset) {
            DB::table('assets')
                ->where('id', $asset->id)
                ->update(['category_id' => $categoryIds[$asset->category] ?? null]);
        }
    }

    private function backfillAssetDerivedFields(): void
    {
        $latestQrPayloads = DB::table('asset_qr_identities')
            ->select('asset_id', 'qr_uid', 'payload_version')
            ->orderByDesc('id')
            ->get()
            ->groupBy('asset_id')
            ->map(fn ($rows) => $rows->first());

        foreach (DB::table('assets')->select(
            'id',
            'purchase_date',
            'warranty_expiry',
            'purchase_cost',
            'salvage_value',
            'useful_life_months'
        )->get() as $asset) {
            $purchaseDate = $asset->purchase_date ? Carbon::parse($asset->purchase_date) : null;
            $warrantyExpiry = $asset->warranty_expiry ? Carbon::parse($asset->warranty_expiry) : null;

            $warrantyMonths = null;
            if ($purchaseDate && $warrantyExpiry && $warrantyExpiry->greaterThanOrEqualTo($purchaseDate)) {
                $warrantyMonths = $purchaseDate->diffInMonths($warrantyExpiry);
            }

            $depreciationRate = null;
            if ($asset->purchase_cost && $asset->useful_life_months && $asset->useful_life_months > 0) {
                $depreciationRate = round(
                    (($asset->purchase_cost - ($asset->salvage_value ?? 0)) / $asset->purchase_cost) / $asset->useful_life_months,
                    4
                );
            }

            $qr = $latestQrPayloads[$asset->id] ?? null;
            $qrValue = $qr
                ? implode('|', ['MESOCO', 'ASSET', $qr->payload_version, $qr->qr_uid])
                : null;

            DB::table('assets')
                ->where('id', $asset->id)
                ->update([
                    'warranty_period_months' => $warrantyMonths,
                    'depreciation_rate' => $depreciationRate,
                    'qr_value' => $qrValue,
                ]);
        }
    }

    private function backfillRequestPrimaryAsset(): void
    {
        $primaryAssets = DB::table('request_items')
            ->select('request_id', DB::raw('MIN(asset_id) as asset_id'))
            ->whereNotNull('asset_id')
            ->groupBy('request_id')
            ->get();

        foreach ($primaryAssets as $row) {
            DB::table('requests')
                ->where('id', $row->request_id)
                ->update(['asset_id' => $row->asset_id]);
        }
    }

    private function backfillMaintenanceAssignments(): void
    {
        foreach (DB::table('maintenance_events')->select('id', 'assigned_to')->whereNotNull('assigned_to')->get() as $event) {
            $matchedUserId = DB::table('users')
                ->where('name', $event->assigned_to)
                ->orWhere('email', $event->assigned_to)
                ->value('id');

            if ($matchedUserId) {
                DB::table('maintenance_events')
                    ->where('id', $event->id)
                    ->update(['assigned_to_user_id' => $matchedUserId]);
            }
        }
    }

    private function backfillLegacyRetiredAssets(): void
    {
        $now = now();

        foreach (DB::table('assets')
            ->where('status', 'retired')
            ->select('id', 'off_service_reason', 'off_service_from', 'off_service_set_by', 'purchase_cost', 'salvage_value')
            ->get() as $asset) {
            $existing = DB::table('disposals')->where('asset_id', $asset->id)->exists();

            if ($existing) {
                continue;
            }

            DB::table('disposals')->insert([
                'code' => sprintf('DSP-LEGACY-%04d', $asset->id),
                'asset_id' => $asset->id,
                'method' => 'destroy',
                'reason' => $asset->off_service_reason ?: 'Legacy retirement record',
                'disposed_by_user_id' => $asset->off_service_set_by,
                'approved_by_user_id' => $asset->off_service_set_by,
                'disposed_at' => $asset->off_service_from ?: $now,
                'asset_book_value' => $asset->salvage_value ?? $asset->purchase_cost,
                'proceeds_amount' => null,
                'note' => 'Backfilled from retired asset status',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
};
