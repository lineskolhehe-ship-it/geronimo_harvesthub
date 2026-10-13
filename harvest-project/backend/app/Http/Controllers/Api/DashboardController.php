<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyerRequest;
use App\Models\CropListing;
use App\Models\HarvestRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = match ($user->role) {
            'admin' => [
                ['key' => 'users', 'label' => 'Registered Users', 'value' => User::count()],
                ['key' => 'listings', 'label' => 'Total Crop Listings', 'value' => CropListing::count()],
                ['key' => 'available', 'label' => 'Available Crop Listings', 'value' => CropListing::where('status', 'available')->count()],
                ['key' => 'harvests', 'label' => 'Total Harvest Records', 'value' => HarvestRecord::count()],
                ['key' => 'pending', 'label' => 'Pending Buyer Requests', 'value' => BuyerRequest::where('status', 'pending')->count()],
                ['key' => 'completed', 'label' => 'Completed Sales', 'value' => BuyerRequest::where('status', 'completed')->count()],
            ],
            'farmer' => [
                ['key' => 'harvests', 'label' => 'My Harvest Records', 'value' => $user->harvestRecords()->count()],
                ['key' => 'listings', 'label' => 'My Available Listings', 'value' => $user->cropListings()->where('status', 'available')->count()],
                ['key' => 'pending', 'label' => 'Pending Requests to Review', 'value' => $this->requestsForFarmer($user)->where('status', 'pending')->count()],
                ['key' => 'completed', 'label' => 'Completed Sales', 'value' => $this->requestsForFarmer($user)->where('status', 'completed')->count()],
            ],
            default => [
                ['key' => 'available', 'label' => 'Crops Available Now', 'value' => CropListing::where('status', 'available')->count()],
                ['key' => 'mine', 'label' => 'My Requests', 'value' => $user->buyerRequests()->count()],
                ['key' => 'pending', 'label' => 'Pending Requests', 'value' => $user->buyerRequests()->where('status', 'pending')->count()],
                ['key' => 'approved', 'label' => 'Approved Requests', 'value' => $user->buyerRequests()->where('status', 'approved')->count()],
            ],
        };

        return response()->json(['data' => ['role' => $user->role, 'stats' => $stats]]);
    }

    private function requestsForFarmer(User $farmer)
    {
        return BuyerRequest::whereHas('cropListing', fn ($q) => $q->where('farmer_id', $farmer->id));
    }
}
