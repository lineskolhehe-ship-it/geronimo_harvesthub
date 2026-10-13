<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BuyerRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'buyer_id' => $this->buyer_id,
            'crop_listing' => new CropListingResource($this->whenLoaded('cropListing')),
            'crop_listing_id' => $this->crop_listing_id,
            'requested_quantity' => $this->requested_quantity,
            'message' => $this->message,
            'status' => $this->status,
            'created_at' => $this->created_at?->toDateString(),
        ];
    }
}
