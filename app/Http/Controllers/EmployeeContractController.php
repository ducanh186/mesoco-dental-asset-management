<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeContractRequest;
use App\Http\Requests\UpdateEmployeeContractRequest;
use App\Models\Employee;
use App\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * EmployeeContractController
 * 
 * Handles CRUD operations for employee contracts.
 * Admin-only access enforced via FormRequest authorize() + route middleware.
 */
class EmployeeContractController extends Controller
{
    /**
     * List contracts for a specific employee.
     * 
     * GET /api/employees/{employee}/contracts
     */
    public function index(Request $request, Employee $employee): JsonResponse
    {
        $query = EmployeeContract::forEmployee($employee->id)
            ->with(['createdBy'])
            ->byStatus($request->input('status'))
            ->byType($request->input('type'))
            ->orderBy('start_date', 'desc');

        $contracts = $query->get();

        return response()->json([
            'contracts' => $contracts->map(fn($c) => $c->toApiArray()),
            'employee' => [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
            ],
            'available_types' => EmployeeContract::TYPES,
            'available_statuses' => EmployeeContract::STATUSES,
        ]);
    }

    /**
     * Create a new contract for an employee.
     * 
     * POST /api/employees/{employee}/contracts
     */
    public function store(StoreEmployeeContractRequest $request, Employee $employee): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Create the contract
        $contract = new EmployeeContract([
            'employee_id' => $employee->id,
            'department' => $validated['department'] ?? null,
            'contract_type' => $validated['contract_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'status' => $validated['status'] ?? EmployeeContract::STATUS_ACTIVE,
            'created_by' => $user->id,
        ]);

        $contract->save();

        // Handle PDF upload
        if ($request->hasFile('pdf')) {
            $pdfPath = EmployeeContract::getPdfStoragePath($employee->id, $contract->id);
            $request->file('pdf')->storeAs(
                dirname($pdfPath),
                basename($pdfPath),
                'local'
            );
            $contract->update(['pdf_path' => $pdfPath]);
        }

        $contract->load('createdBy');

        return response()->json([
            'message' => 'Contract created successfully.',
            'contract' => $contract->toApiArray(),
        ], 201);
    }

    /**
     * Get contract details.
     * 
     * GET /api/contracts/{contract}
     */
    public function show(EmployeeContract $contract): JsonResponse
    {
        $contract->load(['employee', 'createdBy']);

        return response()->json([
            'contract' => $contract->toApiArray(),
        ]);
    }

    /**
     * Update contract metadata/status.
     * 
     * PUT /api/contracts/{contract}
     */
    public function update(UpdateEmployeeContractRequest $request, EmployeeContract $contract): JsonResponse
    {
        $validated = $request->validated();

        // Update fields
        $contract->fill([
            'department' => $validated['department'] ?? $contract->department,
            'contract_type' => $validated['contract_type'] ?? $contract->contract_type,
            'start_date' => $validated['start_date'] ?? $contract->start_date,
            'end_date' => array_key_exists('end_date', $validated) ? $validated['end_date'] : $contract->end_date,
            'status' => $validated['status'] ?? $contract->status,
        ]);

        $contract->save();

        // Handle PDF upload (replace existing if any)
        if ($request->hasFile('pdf')) {
            // Delete old PDF if exists
            if ($contract->pdf_path && Storage::disk('local')->exists($contract->pdf_path)) {
                Storage::disk('local')->delete($contract->pdf_path);
            }

            $pdfPath = EmployeeContract::getPdfStoragePath($contract->employee_id, $contract->id);
            $request->file('pdf')->storeAs(
                dirname($pdfPath),
                basename($pdfPath),
                'local'
            );
            $contract->update(['pdf_path' => $pdfPath]);
        }

        $contract->load(['employee', 'createdBy']);

        return response()->json([
            'message' => 'Contract updated successfully.',
            'contract' => $contract->toApiArray(),
        ]);
    }

    /**
     * Delete a contract.
     * 
     * DELETE /api/contracts/{contract}
     */
    public function destroy(Request $request, EmployeeContract $contract): JsonResponse
    {
        // Admin check (since we're not using FormRequest here)
        if (!$request->user()?->canManageUsers()) {
            return response()->json([
                'message' => 'Forbidden. Only managers can delete contracts.',
            ], 403);
        }

        // Delete PDF file if exists
        if ($contract->pdf_path && Storage::disk('local')->exists($contract->pdf_path)) {
            Storage::disk('local')->delete($contract->pdf_path);
        }

        $contract->delete();

        return response()->json([
            'message' => 'Contract deleted successfully.',
        ]);
    }

    /**
     * Stream the contract PDF file.
     * 
     * GET /api/contracts/{contract}/file
     */
    public function streamFile(Request $request, EmployeeContract $contract): StreamedResponse|JsonResponse
    {
        // Admin check
        if (!$request->user()?->canManageUsers()) {
            return response()->json([
                'message' => 'Forbidden. Only managers can view contract files.',
            ], 403);
        }

        if (!$contract->hasPdf()) {
            return response()->json([
                'message' => 'No PDF file attached to this contract.',
            ], 404);
        }

        if (!Storage::disk('local')->exists($contract->pdf_path)) {
            return response()->json([
                'message' => 'PDF file not found in storage.',
            ], 404);
        }

        $filename = "contract_{$contract->employee_id}_{$contract->id}.pdf";

        return Storage::disk('local')->response(
            $contract->pdf_path,
            $filename,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]
        );
    }
}
