<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BuyerRequestRequest;
use App\Http\Requests\UpdateRequestStatusRequest;
use App\Http\Resources\BuyerRequestResource;
use App\Models\BuyerRequest;
use App\Models\CropListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class BuyerRequestController extends Controller
{
    private const WITH = ['buyer', 'cropListing.crop', 'cropListing.farmer'];

    /**
     * Allowed status moves per role:  current => [next, ...]
     * Farmers act only on requests for their own listings.
     */
    private const TRANSITIONS = [
        'farmer' => ['pending' => ['approved', 'rejected'], 'approved' => ['completed']],
        'admin'  => ['pending' => ['approved', 'rejected'], 'approved' => ['completed']],
        'buyer'  => ['pending' => ['cancelled']],
    ];

    public function index(Request $request)
    {
        $user = $request->user();

        $requests = BuyerRequest::with(self::WITH)
            ->when($user->isBuyer(), fn ($q) => $q->where('buyer_id', $user->id))
            ->when($user->isFarmer(), fn ($q) => $q->whereHas(
                'cropListing', fn ($l) => $l->where('farmer_id', $user->id)
            ))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'cropListing.crop', fn ($c) => $c->where('name', 'like', "%{$s}%")
            ))
            ->latest()
            ->paginate(min($request->integer('per_page', 10), 50));

        return BuyerRequestResource::collection($requests);
    }

    public function store(BuyerRequestRequest $request): JsonResponse
    {
        Gate::authorize('create', BuyerRequest::class);

        $buyerRequest = BuyerRequest::create($request->validated() + [
            'buyer_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return (new BuyerRequestResource($buyerRequest->load(self::WITH)))
            ->response()->setStatusCode(201);
    }

    public function show(BuyerRequest $buyerRequest): BuyerRequestResource
    {
        Gate::authorize('view', $buyerRequest);

        return new BuyerRequestResource($buyerRequest->load(self::WITH));
    }

    public function update(BuyerRequestRequest $request, BuyerRequest $buyerRequest): BuyerRequestResource
    {
        Gate::authorize('update', $buyerRequest);

        $buyerRequest->update($request->validated());

        return new BuyerRequestResource($buyerRequest->load(self::WITH));
    }

    public function destroy(BuyerRequest $buyerRequest): Response
    {
        Gate::authorize('delete', $buyerRequest);

        $buyerRequest->delete();

        return response()->noContent();
    }

    /** PATCH /buyer-requests/{id}/status */
    public function updateStatus(UpdateRequestStatusRequest $request, BuyerRequest $buyerRequest): JsonResponse|BuyerRequestResource
    {
        $user = $request->user();
        $next = $request->validated()['status'];
        $buyerRequest->load('cropListing');

        // Who may touch this request at all?
        $isOwnerBuyer = $user->isBuyer() && $buyerRequest->buyer_id === $user->id;
        $isOwnerFarmer = $user->isFarmer() && $buyerRequest->cropListing->farmer_id === $user->id;
        if (! ($user->isAdmin() || $isOwnerBuyer || $isOwnerFarmer)) {
            return response()->json(['message' => 'You do not have permission to change this request.'], 403);
        }

        // Is the move allowed for this role?
        $allowed = self::TRANSITIONS[$user->role][$buyerRequest->status] ?? [];
        if (! in_array($next, $allowed, true)) {
            return response()->json([
                'message' => "A {$buyerRequest->status} request cannot be changed to {$next} by a {$user->role}.",
                'errors' => ['status' => ['Invalid status change.']],
            ], 422);
        }

        return DB::transaction(function () use ($buyerRequest, $next) {
            $listing = CropListing::lockForUpdate()->find($buyerRequest->crop_listing_id);

            if (in_array($next, ['approved', 'completed'], true)
                && (float) $buyerRequest->requested_quantity > (float) $listing->available_quantity) {
                return response()->json([
                    'message' => "Only {$listing->available_quantity} {$listing->unit} is left on this listing.",
                    'errors' => ['status' => ['Not enough quantity available.']],
                ], 422);
            }

            // Stock is deducted when the sale is completed.
            if ($next === 'completed') {
                $listing->available_quantity -= $buyerRequest->requested_quantity;
                if ((float) $listing->available_quantity <= 0) {
                    $listing->status = 'sold_out';
                }
                $listing->save();
            }

            $buyerRequest->update(['status' => $next]);

            return new BuyerRequestResource($buyerRequest->load(self::WITH));
        });
    }
}
