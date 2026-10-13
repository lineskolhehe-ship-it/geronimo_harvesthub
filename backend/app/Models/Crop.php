<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Crop extends Model
{
    use HasFactory;

    public const CATEGORIES = [
        'Vegetables', 'Fruits', 'Grains', 'Root Crops', 'Legumes', 'Herbs & Spices',
    ];

    protected $fillable = ['name', 'category', 'description'];

    public function harvestRecords(): HasMany
    {
        return $this->hasMany(HarvestRecord::class);
    }

    public function cropListings(): HasMany
    {
        return $this->hasMany(CropListing::class);
    }
}
