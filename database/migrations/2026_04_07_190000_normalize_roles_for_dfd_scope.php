<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        foreach ([
            'manager' => 'Manager',
            'technician' => 'Technician',
            'doctor' => 'Doctor',
            'employee' => 'Employee',
        ] as $code => $name) {
            $this->upsertRole($code, $name, true, $now);
        }

        $roleIds = DB::table('roles')->pluck('id', 'code');

        foreach (DB::table('users')->select('id', 'role')->cursor() as $user) {
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

        if (DB::getSchemaBuilder()->hasColumn('employees', 'department')) {
            $roleByEmployeeId = DB::table('users')
                ->whereNotNull('employee_id')
                ->pluck('role', 'employee_id');

            foreach (DB::table('employees')->select('id')->cursor() as $employee) {
                $role = $roleByEmployeeId[$employee->id] ?? 'employee';

                $department = match ($role) {
                    'manager' => 'management',
                    'technician' => 'technical',
                    'doctor' => 'clinical',
                    default => 'operations',
                };

                DB::table('employees')
                    ->where('id', $employee->id)
                    ->update(['department' => $department]);
            }
        }

        DB::table('roles')
            ->whereIn('code', ['admin', 'hr'])
            ->update([
                'is_active' => false,
                'updated_at' => $now,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $now = now();

        foreach ([
            'admin' => 'Admin',
            'hr' => 'HR',
            'doctor' => 'Doctor',
            'technician' => 'Technician',
            'employee' => 'Employee',
        ] as $code => $name) {
            $this->upsertRole($code, $name, true, $now);
        }

        $roleIds = DB::table('roles')->pluck('id', 'code');

        foreach (DB::table('users')->select('id', 'role')->cursor() as $user) {
            $legacyRole = match ($user->role) {
                'manager' => 'admin',
                'technician' => 'hr',
                default => $user->role,
            };

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'role' => $legacyRole,
                    'role_id' => $roleIds[$legacyRole] ?? null,
                ]);
        }
    }

    private function upsertRole(string $code, string $name, bool $isActive, $timestamp): void
    {
        $existing = DB::table('roles')->where('code', $code)->first();

        if ($existing) {
            DB::table('roles')
                ->where('id', $existing->id)
                ->update([
                    'name' => $name,
                    'description' => null,
                    'is_active' => $isActive,
                    'updated_at' => $timestamp,
                ]);

            return;
        }

        DB::table('roles')->insert([
            'code' => $code,
            'name' => $name,
            'description' => null,
            'is_active' => $isActive,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }
};
