<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetReturn;
use App\Models\Assignment;
use App\Models\AssignmentDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HandoverApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_handover_records_return_assignment_and_return_summary(): void
    {
        $manager = User::factory()->manager()->create([
            'name' => 'Quan ly IT',
            'must_change_password' => false,
        ]);
        $staff = User::factory()->employee()->create([
            'name' => 'Nhan vien A',
            'must_change_password' => false,
        ]);

        $activeAssignment = Assignment::create([
            'staff_id' => $staff->id,
            'admin_id' => $manager->id,
            'approved_by' => $manager->id,
            'assign_date' => now()->subDays(5),
            'note' => 'Bàn giao cho dự án A',
        ]);
        AssignmentDetail::create([
            'assignment_id' => $activeAssignment->id,
            'asset_id' => Asset::factory()->create(['asset_code' => 'TB-001', 'name' => 'Laptop Dell'])->id,
        ]);

        $returnedAssignment = Assignment::create([
            'staff_id' => $staff->id,
            'admin_id' => $manager->id,
            'approved_by' => $manager->id,
            'assign_date' => now()->subDays(12),
            'note' => 'Bàn giao tạm',
        ]);
        AssignmentDetail::create([
            'assignment_id' => $returnedAssignment->id,
            'asset_id' => Asset::factory()->create(['asset_code' => 'TB-002', 'name' => 'Màn hình LG'])->id,
        ]);
        AssetReturn::create([
            'assignment_id' => $returnedAssignment->id,
            'staff_id' => $staff->id,
            'admin_id' => $manager->id,
            'approved_by' => $manager->id,
            'return_date' => now()->subDays(2),
            'reason' => 'Thu hồi sau dự án',
            'return_condition' => 'Màn hình còn dùng tốt',
        ]);

        $this->actingAs($manager)
            ->getJson('/api/handover-records')
            ->assertOk()
            ->assertJsonPath('summary.total', 2)
            ->assertJsonPath('summary.active', 1)
            ->assertJsonPath('summary.returned', 1)
            ->assertJsonPath('summary.assets', 2)
            ->assertJsonFragment(['return_condition' => 'Màn hình còn dùng tốt'])
            ->assertJsonPath('data.0.staff_name', 'Nhan vien A')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'staff_name', 'status', 'assets', 'assigned_at', 'returned_at', 'return_condition'],
                ],
            ]);
    }
}
