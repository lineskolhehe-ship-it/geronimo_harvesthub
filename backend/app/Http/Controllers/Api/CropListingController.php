<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CropListingRequest;
use App\Http\Resources\CropListingResource;
use App\Models\CropListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class CropListingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $listings = CropListing::with(['crop', 'farmer'])
            ->when($request->boolean('mine'), fn ($q) => $q->where('farmer_id', $user->id))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->whereHas('crop', fn ($c) => $c->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('farmer', fn ($f) => $f->where('name', 'like', "%{$s}%"));
            }))
            ->when($request->category, fn ($q, $c) => $q->whereHas('crop', fn ($cr) => $cr->where('category', $c)))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            // Buyers only see available listings unless they filter by status explicitly.
            ->when($user->isBuyer() && ! $request->filled('status'), fn ($q) => $q->where('status', 'available'))
            ->latest()
            ->paginate(min($request->integer('per_page', 9), 50));

        return CropListingResource::collection($listings);
    }

    public function store(CropListingRequest $request): JsonResponse
    {
        Gate::authorize('create', CropListing::class);

        $listing = CropListing::create($request->validated() + ['farmer_id' => $request->user()->id]);

        return (new CropListingResource($listing->load(['crop', 'farmer'])))
            ->response()->setStatusCode(201);
    }

    public function show(CropListing $cropListing): CropListingResource
    {
        return new CropListingResource($cropListing->load(['crop', 'farmer']));
    }

    public function update(CropListingRequest $request, CropListing $cropListing): CropListingResource
    {
        Gate::authorize('update', $cropListing);

        $cropListing->update($request->validated());

        return new CropListingResource($cropListing->load(['crop', 'farmer']));
    }

    public function destroy(CropListing $cropListing): Response
    {
        Gate::authorize('delete', $cropListing);

        $cropListing->delete();

        return response()->noContent();
    }
}
