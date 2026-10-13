<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropListing extends Model
{
    use HasFactory;

    public const STATUSES = ['available', 'sold_out'];

    protected $fillable = [
        'farmer_id', 'crop_id', 'harvest_record_id', 'available_quantity',
        'unit', 'price_per_unit', 'harvest_date', 'status', 'description',
    ];

    protected function casts(): array
    {
        return [
            'available_quantity' => 'decimal:2',
            'price_per_unit' => 'decimal:2',
            'harvest_date' => 'date:Y-m-d',
        ];
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function crop(): BelongsTo
    {
        return $this->belongsTo(Crop::class);
    }

    public function harvestRecord(): BelongsTo
    {
        return $this->belongsTo(HarvestRecord::class);
    }

    public function buyerRequests(): HasMany
    {
        return $this->hasMany(BuyerRequest::class);
    }
}
