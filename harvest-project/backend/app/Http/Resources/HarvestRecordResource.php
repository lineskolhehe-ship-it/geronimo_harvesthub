<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HarvestRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop' => new CropResource($this->whenLoaded('crop')),
            'crop_id' => $this->crop_id,
            'farmer' => new UserResource($this->whenLoaded('farmer')),
            'farmer_id' => $this->farmer_id,
            'expected_quantity' => $this->expected_quantity,
            'actual_quantity' => $this->actual_quantity,
            'unit' => $this->unit,
            'harvest_date' => $this->harvest_date?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes,
        ];
    }
}
