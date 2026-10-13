<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CropRequest;
use App\Http\Resources\CropResource;
use App\Models\Crop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** index/show: any authenticated user. store/update/destroy: admin only (see routes). */
class CropController extends Controller
{
    public function index(Request $request)
    {
        $query = Crop::query()
            ->withCount('cropListings')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
            ->orderBy('name');

        // ?all=1 returns every crop (for dropdowns); otherwise paginated.
        if ($request->boolean('all')) {
            return CropResource::collection($query->get());
        }

        return CropResource::collection($query->paginate(min($request->integer('per_page', 10), 50)));
    }

    public function store(CropRequest $request): JsonResponse
    {
        $crop = Crop::create($request->validated());

        return (new CropResource($crop))->response()->setStatusCode(201);
    }

    public function show(Crop $crop): CropResource
    {
        return new CropResource($crop);
    }

    public function update(CropRequest $request, Crop $crop): CropResource
    {
        $crop->update($request->validated());

        return new CropResource($crop);
    }

    public function destroy(Crop $crop): Response|JsonResponse
    {
        if ($crop->harvestRecords()->exists() || $crop->cropListings()->exists()) {
            return response()->json([
                'message' => 'This crop is used by harvest records or listings and cannot be deleted.',
            ], 422);
        }

        $crop->delete();

        return response()->noContent();
    }
}
