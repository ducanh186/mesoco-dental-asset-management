<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ProfileController
 * 
 * Handles user profile operations (View Profile screen).
 * Profile data comes from the linked employee record.
 * 
 * Editable fields: full_name, position, dob, gender, phone, address
 * IMMUTABLE (422 if sent): employee_code, email
 */
class ProfileController extends Controller
{
    /**
     * GET /api/profile
     * Get the authenticated user's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Profile not found. No employee record linked to this account.',
            ], 404);
        }

        return response()->json([
            'profile' => [
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'position' => $employee->position,
                'dob' => $employee->dob?->format('Y-m-d'),
                'gender' => $employee->gender,
                'phone' => $employee->phone,
                'address' => $employee->address,
            ],
            'user' => [
                'id' => $user->id,
                'role' => $user->role,
                'must_change_password' => $user->must_change_password,
            ],
        ]);
    }

    /**
     * PUT /api/profile
     * Update the authenticated user's profile.
     * 
     * Editable: full_name, position, dob, gender, phone, address
     * NOT editable (returns 422): employee_code, email
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Profile not found. No employee record linked to this account.',
            ], 404);
        }

        // Get only the safe/allowed fields
        $data = $request->safeData();

        if (empty($data)) {
            return response()->json([
                'message' => 'No valid fields provided for update.',
            ], 422);
        }

        $employee->update($data);
        $employee->refresh();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => [
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'position' => $employee->position,
                'dob' => $employee->dob?->format('Y-m-d'),
                'gender' => $employee->gender,
                'phone' => $employee->phone,
                'address' => $employee->address,
            ],
        ]);
    }
}
