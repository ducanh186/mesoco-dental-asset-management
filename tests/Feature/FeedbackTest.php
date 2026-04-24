<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Employee;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\ShiftSeeder::class);
    }

    // =========================================================================
    // CREATE FEEDBACK
    // =========================================================================

    public function test_any_authenticated_user_can_create_feedback(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'content' => 'This is a test feedback with enough characters.',
            'type' => 'suggestion',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('feedback.content', 'This is a test feedback with enough characters.')
            ->assertJsonPath('feedback.type', 'suggestion')
            ->assertJsonPath('feedback.status', 'new');

        $this->assertDatabaseHas('feedbacks', [
            'user_id' => $user->id,
            'type' => 'suggestion',
        ]);
    }

    public function test_feedback_can_reference_asset(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'staff']);
        $asset = Asset::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'content' => 'Feedback about this specific asset device.',
            'asset_id' => $asset->id,
            'type' => 'issue',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('feedback.asset_id', $asset->id);
    }

    public function test_feedback_with_rating(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'content' => 'Great service, very satisfied with maintenance.',
            'rating' => 5,
            'type' => 'praise',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('feedback.rating', 5);
    }

    public function test_feedback_requires_content(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'type' => 'issue',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_feedback_content_minimum_length(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'content' => 'short',
            'type' => 'issue',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_feedback_generates_code(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);

        $response = $this->actingAs($user)->postJson('/api/feedbacks', [
            'content' => 'This is a valid feedback content.',
            'type' => 'other',
        ]);

        $response->assertStatus(201);
        $this->assertMatchesRegularExpression('/FB-\d{6}-\d{4}/', $response->json('feedback.code'));
    }

    // =========================================================================
    // LIST FEEDBACK
    // =========================================================================

    public function test_user_sees_only_own_feedback(): void
    {
        $employee1 = Employee::factory()->create();
        $user1 = User::factory()->create(['employee_id' => $employee1->id, 'role' => 'employee']);
        
        $employee2 = Employee::factory()->create();
        $user2 = User::factory()->create(['employee_id' => $employee2->id, 'role' => 'employee']);

        Feedback::factory()->count(3)->create(['user_id' => $user1->id]);
        Feedback::factory()->count(5)->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/feedbacks');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_sees_all_feedback(): void
    {
        $admin = User::factory()->admin()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);

        Feedback::factory()->count(3)->create(['user_id' => $admin->id]);
        Feedback::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->getJson('/api/feedbacks');

        $response->assertOk();
        $this->assertCount(8, $response->json('data'));
    }

    public function test_technician_sees_all_feedback(): void
    {
        $technician = User::factory()->technician()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);

        Feedback::factory()->count(2)->create(['user_id' => $technician->id]);
        Feedback::factory()->count(4)->create(['user_id' => $user->id]);

        $response = $this->actingAs($technician)->getJson('/api/feedbacks');

        $response->assertOk();
        $this->assertCount(6, $response->json('data'));
    }

    public function test_can_filter_feedback_by_status(): void
    {
        $admin = User::factory()->admin()->create();

        Feedback::factory()->count(3)->create(['status' => 'new']);
        Feedback::factory()->count(2)->create(['status' => 'resolved']);

        $response = $this->actingAs($admin)->getJson('/api/feedbacks?status=new');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_filter_feedback_by_type(): void
    {
        $admin = User::factory()->admin()->create();

        Feedback::factory()->count(4)->create(['type' => 'issue']);
        Feedback::factory()->count(2)->create(['type' => 'suggestion']);

        $response = $this->actingAs($admin)->getJson('/api/feedbacks?type=issue');

        $response->assertOk();
        $this->assertCount(4, $response->json('data'));
    }

    // =========================================================================
    // VIEW FEEDBACK
    // =========================================================================

    public function test_user_can_view_own_feedback(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);
        $feedback = Feedback::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson("/api/feedbacks/{$feedback->id}");

        $response->assertOk()
            ->assertJsonPath('id', $feedback->id);
    }

    public function test_user_cannot_view_others_feedback(): void
    {
        $employee1 = Employee::factory()->create();
        $user1 = User::factory()->create(['employee_id' => $employee1->id, 'role' => 'employee']);
        
        $employee2 = Employee::factory()->create();
        $user2 = User::factory()->create(['employee_id' => $employee2->id, 'role' => 'employee']);
        
        $feedback = Feedback::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson("/api/feedbacks/{$feedback->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_view_any_feedback(): void
    {
        $admin = User::factory()->admin()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);
        $feedback = Feedback::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->getJson("/api/feedbacks/{$feedback->id}");

        $response->assertOk()
            ->assertJsonPath('id', $feedback->id);
    }

    // =========================================================================
    // UPDATE FEEDBACK
    // =========================================================================

    public function test_user_can_update_own_new_feedback(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);
        $feedback = Feedback::factory()->create([
            'user_id' => $user->id,
            'status' => 'new',
            'content' => 'Original content here.',
        ]);

        $response = $this->actingAs($user)->putJson("/api/feedbacks/{$feedback->id}", [
            'content' => 'Updated content with more details.',
        ]);

        $response->assertOk()
            ->assertJsonPath('feedback.content', 'Updated content with more details.');
    }

    public function test_user_cannot_update_in_progress_feedback(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);
        $feedback = Feedback::factory()->create([
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($user)->putJson("/api/feedbacks/{$feedback->id}", [
            'content' => 'Try to update in progress feedback.',
        ]);

        $response->assertForbidden();
    }

    public function test_manager_can_update_status(): void
    {
        $admin = User::factory()->admin()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);
        $feedback = Feedback::factory()->create([
            'user_id' => $user->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($admin)->patchJson("/api/feedbacks/{$feedback->id}/status", [
            'status' => 'in_progress',
        ]);

        $response->assertOk()
            ->assertJsonPath('feedback.status', 'in_progress');
    }

    public function test_resolve_feedback_sets_resolver(): void
    {
        $admin = User::factory()->admin()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);
        $feedback = Feedback::factory()->create([
            'user_id' => $user->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($admin)->patchJson("/api/feedbacks/{$feedback->id}/status", [
            'status' => 'resolved',
            'response' => 'Issue has been fixed.',
        ]);

        $response->assertOk()
            ->assertJsonPath('feedback.status', 'resolved')
            ->assertJsonPath('feedback.resolved_by', $admin->id);

        $this->assertNotNull(Feedback::find($feedback->id)->resolved_at);
    }

    public function test_employee_cannot_manage_feedback(): void
    {
        $employee1 = Employee::factory()->create();
        $employeeUser = User::factory()->create(['employee_id' => $employee1->id, 'role' => 'employee']);
        
        $employee2 = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee2->id]);
        $feedback = Feedback::factory()->create(['user_id' => $user->id, 'status' => 'new']);

        $response = $this->actingAs($employeeUser)->patchJson("/api/feedbacks/{$feedback->id}/status", [
            'status' => 'in_progress',
        ]);

        $response->assertForbidden();
    }

    public function test_technician_can_manage_feedback(): void
    {
        $technician = User::factory()->technician()->create();
        
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id]);
        $feedback = Feedback::factory()->create(['user_id' => $user->id, 'status' => 'new']);

        $response = $this->actingAs($technician)->patchJson("/api/feedbacks/{$feedback->id}/status", [
            'status' => 'in_progress',
        ]);

        $response->assertOk()
            ->assertJsonPath('feedback.status', 'in_progress');
    }

    // =========================================================================
    // DELETE FEEDBACK
    // =========================================================================

    public function test_admin_can_delete_feedback(): void
    {
        $admin = User::factory()->admin()->create();
        $feedback = Feedback::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/feedbacks/{$feedback->id}");

        $response->assertOk();
        $this->assertSoftDeleted('feedbacks', ['id' => $feedback->id]);
    }

    public function test_hr_cannot_delete_feedback(): void
    {
        $hr = User::factory()->hr()->create();
        $feedback = Feedback::factory()->create();

        $response = $this->actingAs($hr)->deleteJson("/api/feedbacks/{$feedback->id}");

        $response->assertForbidden();
    }

    public function test_user_cannot_delete_own_feedback(): void
    {
        $employee = Employee::factory()->create();
        $user = User::factory()->create(['employee_id' => $employee->id, 'role' => 'employee']);
        $feedback = Feedback::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->deleteJson("/api/feedbacks/{$feedback->id}");

        $response->assertForbidden();
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================

    public function test_can_get_feedback_summary(): void
    {
        $admin = User::factory()->admin()->create();

        Feedback::factory()->count(3)->create(['status' => 'new']);
        Feedback::factory()->count(2)->create(['status' => 'in_progress']);
        Feedback::factory()->count(5)->create(['status' => 'resolved']);

        $response = $this->actingAs($admin)->getJson('/api/feedbacks/summary');

        $response->assertOk()
            ->assertJsonPath('total', 10)
            ->assertJsonPath('new', 3)
            ->assertJsonPath('in_progress', 2)
            ->assertJsonPath('resolved', 5);
    }
}
