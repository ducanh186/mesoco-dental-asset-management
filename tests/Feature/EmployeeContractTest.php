<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeContract;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * EmployeeContractTest
 * 
 * Feature tests for the Employee Contract module.
 * Validates CRUD operations, PDF upload/stream, and RBAC enforcement.
 */
class EmployeeContractTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $hrUser;
    protected User $staffUser;
    protected Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->admin = User::factory()->admin()->create();
        $this->hrUser = User::factory()->hr()->create();
        $this->staffUser = User::factory()->create(['role' => 'employee']);

        // Create an employee for contract tests
        $this->employee = Employee::factory()->create();

        // Setup fake storage
        Storage::fake('local');
    }

    /*
    |--------------------------------------------------------------------------
    | Authorization Tests (RBAC)
    |--------------------------------------------------------------------------
    */

    public function test_non_admin_gets_403_when_listing_contracts(): void
    {
        $response = $this->actingAs($this->hrUser)
            ->getJson("/api/employees/{$this->employee->id}/contracts");

        $response->assertForbidden();
    }

    public function test_non_admin_gets_403_when_creating_contract(): void
    {
        $response = $this->actingAs($this->hrUser)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_gets_403_when_viewing_contract(): void
    {
        $contract = EmployeeContract::factory()->forEmployee($this->employee)->create();

        $response = $this->actingAs($this->staffUser)
            ->getJson("/api/contracts/{$contract->id}");

        $response->assertForbidden();
    }

    public function test_non_admin_gets_403_when_updating_contract(): void
    {
        $contract = EmployeeContract::factory()->forEmployee($this->employee)->create();

        $response = $this->actingAs($this->hrUser)
            ->putJson("/api/contracts/{$contract->id}", [
                'status' => 'EXPIRED',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_gets_403_when_deleting_contract(): void
    {
        $contract = EmployeeContract::factory()->forEmployee($this->employee)->create();

        $response = $this->actingAs($this->hrUser)
            ->deleteJson("/api/contracts/{$contract->id}");

        $response->assertForbidden();
    }

    public function test_non_admin_gets_403_when_streaming_pdf(): void
    {
        $contract = EmployeeContract::factory()->forEmployee($this->employee)->create([
            'pdf_path' => 'contracts/1/1.pdf',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->getJson("/api/contracts/{$contract->id}/file");

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_gets_401(): void
    {
        $response = $this->getJson("/api/employees/{$this->employee->id}/contracts");

        $response->assertUnauthorized();
    }

    /*
    |--------------------------------------------------------------------------
    | List Contracts Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_list_contracts_for_employee(): void
    {
        EmployeeContract::factory()->count(3)->forEmployee($this->employee)->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/employees/{$this->employee->id}/contracts");

        $response->assertOk()
            ->assertJsonStructure([
                'contracts' => [
                    '*' => [
                        'id',
                        'employee_id',
                        'department',
                        'contract_type',
                        'start_date',
                        'end_date',
                        'status',
                        'has_pdf',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'employee' => ['id', 'employee_code', 'full_name'],
                'available_types',
                'available_statuses',
            ])
            ->assertJsonCount(3, 'contracts');
    }

    public function test_admin_can_filter_contracts_by_status(): void
    {
        EmployeeContract::factory()->forEmployee($this->employee)->active()->count(2)->create();
        EmployeeContract::factory()->forEmployee($this->employee)->expired()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/employees/{$this->employee->id}/contracts?status=ACTIVE");

        $response->assertOk()
            ->assertJsonCount(2, 'contracts');
    }

    public function test_admin_can_filter_contracts_by_type(): void
    {
        EmployeeContract::factory()->forEmployee($this->employee)->fullTime()->count(2)->create();
        EmployeeContract::factory()->forEmployee($this->employee)->partTime()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/employees/{$this->employee->id}/contracts?type=FULL_TIME");

        $response->assertOk()
            ->assertJsonCount(2, 'contracts');
    }

    /*
    |--------------------------------------------------------------------------
    | Create Contract Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_create_contract_without_pdf(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'end_date' => '2027-12-31',
                'department' => 'Clinical',
                'status' => 'ACTIVE',
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Contract created successfully.',
            ])
            ->assertJsonPath('contract.contract_type', 'FULL_TIME')
            ->assertJsonPath('contract.department', 'Clinical')
            ->assertJsonPath('contract.status', 'ACTIVE')
            ->assertJsonPath('contract.has_pdf', false);

        $this->assertDatabaseHas('employee_contracts', [
            'employee_id' => $this->employee->id,
            'contract_type' => 'FULL_TIME',
            'department' => 'Clinical',
            'created_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_create_contract_with_pdf_upload(): void
    {
        $pdf = UploadedFile::fake()->create('contract.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'PART_TIME',
                'start_date' => '2026-02-01',
                'pdf' => $pdf,
            ]);

        $response->assertCreated()
            ->assertJsonPath('contract.has_pdf', true);

        $contract = EmployeeContract::first();
        Storage::disk('local')->assertExists($contract->pdf_path);
    }

    public function test_create_contract_defaults_status_to_active(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'INTERN',
                'start_date' => '2026-01-15',
            ]);

        $response->assertCreated()
            ->assertJsonPath('contract.status', 'ACTIVE');
    }

    /*
    |--------------------------------------------------------------------------
    | Show Contract Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_view_contract_details(): void
    {
        $contract = EmployeeContract::factory()
            ->forEmployee($this->employee)
            ->createdBy($this->admin)
            ->create([
                'contract_type' => 'FULL_TIME',
                'department' => 'Technical',
            ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/contracts/{$contract->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'contract' => [
                    'id',
                    'employee_id',
                    'employee',
                    'department',
                    'contract_type',
                    'start_date',
                    'end_date',
                    'status',
                    'has_pdf',
                    'created_by',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('contract.contract_type', 'FULL_TIME')
            ->assertJsonPath('contract.department', 'Technical');
    }

    public function test_show_returns_404_for_nonexistent_contract(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/contracts/99999');

        $response->assertNotFound();
    }

    /*
    |--------------------------------------------------------------------------
    | Update Contract Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_update_contract_metadata(): void
    {
        $contract = EmployeeContract::factory()
            ->forEmployee($this->employee)
            ->active()
            ->create([
                'department' => 'Clinical',
            ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/contracts/{$contract->id}", [
                'department' => 'Administration',
                'status' => 'TERMINATED',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Contract updated successfully.',
            ])
            ->assertJsonPath('contract.department', 'Administration')
            ->assertJsonPath('contract.status', 'TERMINATED');

        $this->assertDatabaseHas('employee_contracts', [
            'id' => $contract->id,
            'department' => 'Administration',
            'status' => 'TERMINATED',
        ]);
    }

    public function test_admin_can_replace_pdf_on_update(): void
    {
        // Create contract with initial PDF
        $initialPdf = UploadedFile::fake()->create('initial.pdf', 300, 'application/pdf');
        
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'pdf' => $initialPdf,
            ]);

        $response->assertCreated();

        $contract = EmployeeContract::first();
        $this->assertNotNull($contract->pdf_path);
        Storage::disk('local')->assertExists($contract->pdf_path);

        // Update with new PDF
        $newPdf = UploadedFile::fake()->create('updated.pdf', 500, 'application/pdf');

        $updateResponse = $this->actingAs($this->admin)
            ->putJson("/api/contracts/{$contract->id}", [
                'pdf' => $newPdf,
            ]);

        $updateResponse->assertOk()
            ->assertJsonPath('contract.has_pdf', true);

        $contract->refresh();
        Storage::disk('local')->assertExists($contract->pdf_path);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Contract Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_delete_contract(): void
    {
        $contract = EmployeeContract::factory()->forEmployee($this->employee)->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/contracts/{$contract->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Contract deleted successfully.',
            ]);

        $this->assertDatabaseMissing('employee_contracts', [
            'id' => $contract->id,
        ]);
    }

    public function test_delete_contract_also_removes_pdf_file(): void
    {
        $pdf = UploadedFile::fake()->create('contract.pdf', 500, 'application/pdf');

        $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'pdf' => $pdf,
            ]);

        $contract = EmployeeContract::first();
        $pdfPath = $contract->pdf_path;
        Storage::disk('local')->assertExists($pdfPath);

        $this->actingAs($this->admin)
            ->deleteJson("/api/contracts/{$contract->id}");

        Storage::disk('local')->assertMissing($pdfPath);
    }

    /*
    |--------------------------------------------------------------------------
    | Stream PDF Tests
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_stream_pdf_file(): void
    {
        // Create a contract with PDF
        $pdf = UploadedFile::fake()->create('contract.pdf', 500, 'application/pdf');

        $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'pdf' => $pdf,
            ]);

        $contract = EmployeeContract::first();

        $response = $this->actingAs($this->admin)
            ->get("/api/contracts/{$contract->id}/file");

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_stream_returns_404_when_no_pdf_attached(): void
    {
        $contract = EmployeeContract::factory()
            ->forEmployee($this->employee)
            ->create(['pdf_path' => null]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/contracts/{$contract->id}/file");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'No PDF file attached to this contract.',
            ]);
    }

    public function test_stream_returns_404_when_pdf_file_missing_in_storage(): void
    {
        $contract = EmployeeContract::factory()
            ->forEmployee($this->employee)
            ->create(['pdf_path' => 'contracts/1/nonexistent.pdf']);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/contracts/{$contract->id}/file");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'PDF file not found in storage.',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Validation Tests
    |--------------------------------------------------------------------------
    */

    public function test_create_requires_contract_type(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'start_date' => '2026-01-01',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['contract_type']);
    }

    public function test_create_requires_start_date(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_create_rejects_invalid_contract_type(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'INVALID_TYPE',
                'start_date' => '2026-01-01',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['contract_type']);
    }

    public function test_create_rejects_invalid_status(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'status' => 'INVALID_STATUS',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_create_rejects_end_date_before_start_date(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-06-01',
                'end_date' => '2026-01-01',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_create_rejects_non_pdf_file(): void
    {
        // Create a text file instead of image to avoid GD dependency
        $textFile = UploadedFile::fake()->create('contract.txt', 100, 'text/plain');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'pdf' => $textFile,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_create_rejects_oversized_pdf(): void
    {
        // Create a file larger than 10MB
        $largePdf = UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/employees/{$this->employee->id}/contracts", [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
                'pdf' => $largePdf,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_create_returns_404_for_nonexistent_employee(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/employees/99999/contracts', [
                'contract_type' => 'FULL_TIME',
                'start_date' => '2026-01-01',
            ]);

        $response->assertNotFound();
    }
}
