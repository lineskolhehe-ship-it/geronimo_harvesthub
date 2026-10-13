<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HarvestRecordRequest;
use App\Http\Resources\HarvestRecordResource;
use App\Models\HarvestRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/** Routes are limited to farmer/admin by role middleware; ownership is enforced by the policy. */
class HarvestRecordController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = HarvestRecord::with(['crop', 'farmer'])
            ->when(! $user->isAdmin(), fn ($q) => $q->where('farmer_id', $user->id))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'crop', fn ($c) => $c->where('name', 'like', "%{$s}%")
            ))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest('harvest_date');

        if ($request->boolean('all')) {
            return HarvestRecordResource::collection($query->get());
        }

        return HarvestRecordResource::collection($query->paginate(min($request->integer('per_page', 10), 50)));
    }

    public function store(HarvestRecordRequest $request): JsonResponse
    {
        Gate::authorize('create', HarvestRecord::class);

        $record = HarvestRecord::create($request->validated() + ['farmer_id' => $request->user()->id]);

        return (new HarvestRecordResource($record->load(['crop', 'farmer'])))
            ->response()->setStatusCode(201);
    }

    public function show(HarvestRecord $harvestRecord): HarvestRecordResource
    {
        Gate::authorize('view', $harvestRecord);

        return new HarvestRecordResource($harvestRecord->load(['crop', 'farmer']));
    }

    public function update(HarvestRecordRequest $request, HarvestRecord $harvestRecord): HarvestRecordResource
    {
        Gate::authorize('update', $harvestRecord);

        $harvestRecord->update($request->validated());

        return new HarvestRecordResource($harvestRecord->load(['crop', 'farmer']));
    }

    public function destroy(HarvestRecord $harvestRecord): Response
    {
        Gate::authorize('delete', $harvestRecord);

        $harvestRecord->delete();

        return response()->noContent();
    }
}
