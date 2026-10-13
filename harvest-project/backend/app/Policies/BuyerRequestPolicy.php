<?php

namespace App\Policies;

use App\Models\BuyerRequest;
use App\Models\User;

class BuyerRequestPolicy
{
    public function create(User $user): bool
    {
        return $user->isBuyer();
    }

    public function view(User $user, BuyerRequest $request): bool
    {
        return $user->isAdmin()
            || $request->buyer_id === $user->id
            || $request->cropListing->farmer_id === $user->id;
    }

    /** Buyers may edit their own request only while it is still pending. */
    public function update(User $user, BuyerRequest $request): bool
    {
        return $request->buyer_id === $user->id && $request->status === 'pending';
    }

    public function delete(User $user, BuyerRequest $request): bool
    {
        return $user->isAdmin()
            || ($request->buyer_id === $user->id && $request->status === 'pending');
    }
}
