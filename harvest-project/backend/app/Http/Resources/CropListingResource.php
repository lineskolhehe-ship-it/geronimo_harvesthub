<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop' => new CropResource($this->whenLoaded('crop')),
            'crop_id' => $this->crop_id,
            'farmer' => new UserResource($this->whenLoaded('farmer')),
            'farmer_id' => $this->farmer_id,
            'harvest_record_id' => $this->harvest_record_id,
            'available_quantity' => $this->available_quantity,
            'unit' => $this->unit,
            'price_per_unit' => $this->price_per_unit,
            'harvest_date' => $this->harvest_date?->toDateString(),
            'status' => $this->status,
            'description' => $this->description,
        ];
    }
}
