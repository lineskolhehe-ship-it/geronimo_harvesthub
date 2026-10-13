<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BuyerRequest extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

    protected $fillable = ['buyer_id', 'crop_listing_id', 'requested_quantity', 'message', 'status'];

    protected function casts(): array
    {
        return ['requested_quantity' => 'decimal:2'];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function cropListing(): BelongsTo
    {
        return $this->belongsTo(CropListing::class);
    }
}
