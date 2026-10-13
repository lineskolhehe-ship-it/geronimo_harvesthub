<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLES = ['admin', 'farmer', 'buyer'];

    protected $fillable = ['name', 'email', 'password', 'role', 'phone', 'address'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool  { return $this->role === 'admin'; }
    public function isFarmer(): bool { return $this->role === 'farmer'; }
    public function isBuyer(): bool  { return $this->role === 'buyer'; }

    public function harvestRecords(): HasMany
    {
        return $this->hasMany(HarvestRecord::class, 'farmer_id');
    }

    public function cropListings(): HasMany
    {
        return $this->hasMany(CropListing::class, 'farmer_id');
    }

    public function buyerRequests(): HasMany
    {
        return $this->hasMany(BuyerRequest::class, 'buyer_id');
    }
}
