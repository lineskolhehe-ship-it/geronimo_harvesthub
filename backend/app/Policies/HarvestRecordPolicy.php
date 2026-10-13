<?php

namespace App\Policies;

use App\Models\HarvestRecord;
use App\Models\User;

class HarvestRecordPolicy
{
    public function create(User $user): bool
    {
        return $user->isFarmer();
    }

    public function view(User $user, HarvestRecord $record): bool
    {
        return $user->isAdmin() || $record->farmer_id === $user->id;
    }

    public function update(User $user, HarvestRecord $record): bool
    {
        return $user->isAdmin() || $record->farmer_id === $user->id;
    }

    public function delete(User $user, HarvestRecord $record): bool
    {
        return $user->isAdmin() || $record->farmer_id === $user->id;
    }
}
