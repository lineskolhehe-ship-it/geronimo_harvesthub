<?php

namespace App\Http\Requests;

use App\Models\CropListing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CropListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies are checked in the controller
    }

    public function rules(): array
    {
        // On update the owner is the listing's farmer (an admin may edit it);
        // on create the owner is the authenticated farmer.
        $ownerId = $this->route('crop_listing')?->farmer_id ?? $this->user()->id;

        return [
            'crop_id' => ['required', 'exists:crops,id'],
            'harvest_record_id' => [
                'nullable',
                Rule::exists('harvest_records', 'id')->where('farmer_id', $ownerId),
            ],
            'available_quantity' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'unit' => ['required', 'string', 'max:20'],
            'price_per_unit' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'harvest_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(CropListing::STATUSES)],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
