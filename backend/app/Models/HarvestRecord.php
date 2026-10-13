<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HarvestRecord extends Model
{
    use HasFactory;

    public const STATUSES = ['planned', 'harvested', 'listed'];

    protected $fillable = [
        'farmer_id', 'crop_id', 'expected_quantity', 'actual_quantity',
        'unit', 'harvest_date', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'expected_quantity' => 'decimal:2',
            'actual_quantity' => 'decimal:2',
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

    public function cropListings(): HasMany
    {
        return $this->hasMany(CropListing::class);
    }
}
