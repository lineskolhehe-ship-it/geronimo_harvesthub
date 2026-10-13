<?php

namespace App\Policies;

use App\Models\CropListing;
use App\Models\User;

class CropListingPolicy
{
    public function create(User $user): bool
    {
        return $user->isFarmer();
    }

    public function update(User $user, CropListing $listing): bool
    {
        return $user->isAdmin() || $listing->farmer_id === $user->id;
    }

    public function delete(User $user, CropListing $listing): bool
    {
        return $user->isAdmin() || $listing->farmer_id === $user->id;
    }
}
