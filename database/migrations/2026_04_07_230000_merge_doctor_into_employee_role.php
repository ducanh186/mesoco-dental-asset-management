<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $this->upsertRole('manager', 'Manager', true, $now);
        $this->upsertRole('technician', 'Technician', true, $now);
        $employeeRoleId = $this->upsertRole('employee', 'Employee', true, $now);
        $doctorRoleId = DB::table('roles')->where('code', 'doctor')->value('id');

        $doctorEmployeeIds = DB::table('users')
            ->where('role', 'doctor')
            ->whereNotNull('employee_id')
            ->pluck('employee_id')
            ->all();

        $userQuery = DB::table('users')->where('role', 'doctor');

        if ($doctorRoleId) {
            $userQuery->orWhere('role_id', $doctorRoleId);
        }

        $userQuery->update([
            'role' => 'employee',
            'role_id' => $employeeRoleId,
        ]);

        if ($doctorRoleId) {
            DB::table('roles')
                ->where('id', $doctorRoleId)
                ->update([
                    'is_active' => false,
                    'updated_at' => $now,
                ]);
        }

        if ($doctorEmployeeIds !== [] && Schema::hasColumn('employees', 'department')) {
            DB::table('employees')
                ->whereIn('id', $doctorEmployeeIds)
                ->where('department', 'clinical')
                ->update(['department' => 'operations']);
        }
    }

    public function down(): void
    {
        $this->upsertRole('doctor', 'Doctor', true, now());
    }

    private function upsertRole(string $code, string $name, bool $isActive, $timestamp): int
    {
        $existingId = DB::table('roles')->where('code', $code)->value('id');

        if ($existingId) {
            DB::table('roles')
                ->where('id', $existingId)
                ->update([
                    'name' => $name,
                    'is_active' => $isActive,
                    'updated_at' => $timestamp,
                ]);

            return (int) $existingId;
        }

        return (int) DB::table('roles')->insertGetId([
            'code' => $code,
            'name' => $name,
            'description' => null,
            'is_active' => $isActive,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }
};
