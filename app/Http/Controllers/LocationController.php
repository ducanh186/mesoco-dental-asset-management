<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class LocationController extends Controller
{
    /**
     * Display a listing of locations.
     * 
     * GET /api/locations
     * Query params: ?active_only=1 to filter only active locations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Location::query();

        // Filter by active status if requested
        if ($request->boolean('active_only', false)) {
            $query->active();
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortDir = $request->get('sort_dir', 'asc');
        $allowedSorts = ['name', 'created_at', 'is_active'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        // Pagination (default 25 per page)
        $perPage = min($request->integer('per_page', 25), 100);
        $locations = $query->paginate($perPage);

        return response()->json($locations);
    }

    /**
     * Store a newly created location.
     * 
     * POST /api/locations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:locations,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $location = Location::create($validated);

        return response()->json([
            'message' => 'Location created successfully.',
            'data' => $location,
        ], 201);
    }

    /**
     * Display the specified location.
     * 
     * GET /api/locations/{location}
     */
    public function show(Location $location): JsonResponse
    {
        // Optionally include asset count
        $location->loadCount('assets');

        return response()->json([
            'data' => $location,
        ]);
    }

    /**
     * Update the specified location.
     * 
     * PUT/PATCH /api/locations/{location}
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('locations', 'name')->ignore($location->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $location->update($validated);

        return response()->json([
            'message' => 'Location updated successfully.',
            'data' => $location->fresh(),
        ]);
    }

    /**
     * Remove the specified location.
     * 
     * DELETE /api/locations/{location}
     * 
     * Note: Soft-deletes by setting is_active = false if assets exist,
     * otherwise hard-deletes.
     */
    public function destroy(Location $location): JsonResponse
    {
        // Check if location has any assets
        $assetCount = $location->assets()->count();

        if ($assetCount > 0) {
            // Soft-delete: just mark as inactive
            $location->update(['is_active' => false]);

            return response()->json([
                'message' => "Location deactivated. {$assetCount} asset(s) are still assigned to this location.",
                'data' => $location->fresh(),
            ]);
        }

        // Hard-delete if no assets
        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully.',
        ]);
    }

    /**
     * Get a simple list of active locations for dropdowns.
     * 
     * GET /api/locations/dropdown
     */
    public function dropdown(): JsonResponse
    {
        $locations = Location::active()
            ->orderBy('name')
            ->select(['id', 'name'])
            ->get();

        return response()->json([
            'data' => $locations,
        ]);
    }
}
