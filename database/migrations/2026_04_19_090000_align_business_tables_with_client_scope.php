<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $this->createPermissionTables();
        $this->backfillPermissionTables();
        $this->createBusinessDetailTables();
        $this->backfillBusinessDetails();
        $this->dropRequestWorkflowTables();
    }

    public function down(): void
    {
        $this->restoreRequestWorkflowTables();

        Schema::dropIfExists('inventory_check_items');
        Schema::dropIfExists('inventory_checks');
        Schema::dropIfExists('disposal_details');
        Schema::dropIfExists('maintenance_details');
        Schema::dropIfExists('account_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }

    private function createPermissionTables(): void
    {
        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('code', 100)->unique();
                $table->string('name', 150);
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
                $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
                $table->timestamp('granted_at')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->primary(['role_id', 'permission_id']);
                $table->index('permission_id');
            });
        }

        if (!Schema::hasTable('account_roles')) {
            Schema::create('account_roles', function (Blueprint $table) {
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
                $table->timestamp('assigned_at')->nullable();
                $table->string('status', 30)->default('active');
                $table->text('note')->nullable();
                $table->timestamps();

                $table->primary(['user_id', 'role_id']);
                $table->index(['role_id', 'status']);
            });
        }
    }

    private function backfillPermissionTables(): void
    {
        $now = now();

        $permissions = [
            'assets.manage' => 'Manage assets',
            'purchase_orders.manage' => 'Manage purchase orders',
            'purchase_orders.view_own' => 'View own supplier purchase orders',
            'purchase_orders.update_own_status' => 'Update own supplier purchase order status',
            'maintenance.manage' => 'Manage maintenance',
            'disposal.manage' => 'Manage disposal',
            'inventory.manage' => 'Manage inventory checks',
            'reports.view' => 'View reports',
            'users.manage' => 'Manage users and roles',
            'profile.manage_own' => 'Manage own profile',
        ];

        foreach ($permissions as $code => $name) {
            DB::table('permissions')->updateOrInsert(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $permissionIds = DB::table('permissions')->pluck('id', 'code');
        $roleIds = DB::table('roles')->pluck('id', 'code');

        $rolePermissions = [
            'manager' => array_keys($permissions),
            'technician' => [
                'assets.manage',
                'purchase_orders.manage',
                'maintenance.manage',
                'disposal.manage',
                'inventory.manage',
                'profile.manage_own',
            ],
            'employee' => [
                'profile.manage_own',
            ],
            'supplier' => [
                'purchase_orders.view_own',
                'purchase_orders.update_own_status',
                'profile.manage_own',
            ],
        ];

        foreach ($rolePermissions as $roleCode => $codes) {
            $roleId = $roleIds[$roleCode] ?? null;

            if (!$roleId) {
                continue;
            }

            foreach ($codes as $permissionCode) {
                $permissionId = $permissionIds[$permissionCode] ?? null;

                if (!$permissionId) {
                    continue;
                }

                DB::table('role_permissions')->updateOrInsert(
                    [
                        'role_id' => $roleId,
                        'permission_id' => $permissionId,
                    ],
                    [
                        'granted_at' => $now,
                        'note' => 'Backfilled from canonical RBAC matrix',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        foreach (DB::table('users')->select('id', 'role', 'role_id', 'created_at')->cursor() as $user) {
            $roleId = $user->role_id ?: ($roleIds[$user->role] ?? null);

            if (!$roleId) {
                continue;
            }

            DB::table('account_roles')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'role_id' => $roleId,
                ],
                [
                    'assigned_at' => $user->created_at ?? $now,
                    'status' => 'active',
                    'note' => 'Backfilled from users.role_id',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    private function createBusinessDetailTables(): void
    {
        if (!Schema::hasTable('maintenance_details')) {
            Schema::create('maintenance_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('maintenance_event_id')->constrained('maintenance_events')->cascadeOnDelete();
                $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
                $table->foreignId('technician_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
                $table->string('status', 30)->default('scheduled');
                $table->text('issue_description')->nullable();
                $table->text('action_taken')->nullable();
                $table->decimal('cost', 14, 2)->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamp('logged_at')->nullable();
                $table->timestamps();

                $table->unique('maintenance_event_id');
                $table->index(['asset_id', 'status']);
            });
        }

        if (!Schema::hasTable('disposal_details')) {
            Schema::create('disposal_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('disposal_id')->constrained('disposals')->cascadeOnDelete();
                $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
                $table->string('condition_summary')->nullable();
                $table->decimal('asset_book_value', 14, 2)->nullable();
                $table->decimal('proceeds_amount', 14, 2)->nullable();
                $table->timestamp('processed_at')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->index(['asset_id', 'processed_at']);
            });
        }

        if (!Schema::hasTable('inventory_checks')) {
            Schema::create('inventory_checks', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->string('title')->nullable();
                $table->date('check_date');
                $table->string('status', 30)->default('in_progress');
                $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('completed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('completed_at')->nullable();
                $table->string('location')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->index(['status', 'check_date']);
            });
        }

        if (!Schema::hasTable('inventory_check_items')) {
            Schema::create('inventory_check_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventory_check_id')->constrained('inventory_checks')->cascadeOnDelete();
                $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
                $table->string('expected_status', 30)->nullable();
                $table->string('actual_status', 30)->nullable();
                $table->string('expected_location')->nullable();
                $table->string('actual_location')->nullable();
                $table->string('result', 30)->default('pending');
                $table->text('condition_note')->nullable();
                $table->foreignId('counted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('checked_at')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->unique(['inventory_check_id', 'asset_id'], 'inventory_check_asset_unique');
                $table->index(['asset_id', 'result']);
            });
        }
    }

    private function backfillBusinessDetails(): void
    {
        $now = now();

        if (Schema::hasTable('repair_logs')) {
            foreach (DB::table('repair_logs')->orderBy('id')->cursor() as $log) {
                DB::table('maintenance_details')->updateOrInsert(
                    ['maintenance_event_id' => $log->maintenance_event_id],
                    [
                        'asset_id' => $log->asset_id,
                        'technician_user_id' => $log->technician_user_id,
                        'supplier_id' => $log->supplier_id,
                        'status' => $log->status,
                        'issue_description' => $log->issue_description,
                        'action_taken' => $log->action_taken,
                        'cost' => $log->cost,
                        'started_at' => $log->started_at,
                        'completed_at' => $log->completed_at,
                        'logged_at' => $log->logged_at,
                        'created_at' => $log->created_at ?? $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

        foreach (DB::table('disposals')->orderBy('id')->cursor() as $disposal) {
            DB::table('disposal_details')->updateOrInsert(
                [
                    'disposal_id' => $disposal->id,
                    'asset_id' => $disposal->asset_id,
                ],
                [
                    'condition_summary' => Str::limit((string) $disposal->reason, 255, ''),
                    'asset_book_value' => $disposal->asset_book_value,
                    'proceeds_amount' => $disposal->proceeds_amount,
                    'processed_at' => $disposal->disposed_at,
                    'note' => $disposal->note,
                    'created_at' => $disposal->created_at ?? $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    private function dropRequestWorkflowTables(): void
    {
        if (Schema::hasTable('approvals')) {
            DB::table('approvals')
                ->where('approvable_type', 'App\\Models\\AssetRequest')
                ->delete();
        }

        Schema::dropIfExists('request_events');
        Schema::dropIfExists('request_items');
        Schema::dropIfExists('requests');
    }

    private function restoreRequestWorkflowTables(): void
    {
        if (!Schema::hasTable('requests')) {
            Schema::create('requests', function (Blueprint $table) {
                $table->id();
                $table->string('code', 20)->unique();
                $table->string('type', 30);
                $table->string('status', 20)->default('SUBMITTED');
                $table->foreignId('requested_by_employee_id')->constrained('employees')->cascadeOnDelete();
                $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->text('review_note')->nullable();
                $table->string('title', 255);
                $table->text('description')->nullable();
                $table->string('severity', 20)->nullable();
                $table->timestamp('incident_at')->nullable();
                $table->string('suspected_cause', 50)->nullable();
                $table->timestamps();

                $table->index(['type', 'status']);
                $table->index(['requested_by_employee_id', 'created_at']);
                $table->index(['status', 'created_at']);
            });
        }

        if (!Schema::hasTable('request_items')) {
            Schema::create('request_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->string('item_kind', 20);
                $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->string('sku', 50)->nullable();
                $table->string('name', 255)->nullable();
                $table->decimal('qty', 10, 2)->nullable();
                $table->string('unit', 30)->nullable();
                $table->foreignId('from_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
                $table->foreignId('to_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
                $table->date('from_date')->nullable();
                $table->date('to_date')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->index('request_id');
                $table->index('item_kind');
                $table->index('asset_id');
            });
        }

        if (!Schema::hasTable('request_events')) {
            Schema::create('request_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('event_type', 30);
                $table->json('meta')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['request_id', 'created_at']);
                $table->index('event_type');
            });
        }
    }
};
