<?php

namespace App\Http\Requests;

use App\Models\CropListing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BuyerRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies are checked in the controller
    }

    private function listing(): ?CropListing
    {
        if ($this->isMethod('POST')) {
            return CropListing::find($this->input('crop_listing_id'));
        }

        return $this->route('buyer_request')?->cropListing;
    }

    public function rules(): array
    {
        $rules = [
            'requested_quantity' => [
                'required', 'numeric', 'gt:0',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $listing = $this->listing();
                    if ($listing && (float) $value > (float) $listing->available_quantity) {
                        $fail("Only {$listing->available_quantity} {$listing->unit} is available.");
                    }
                },
            ],
            'message' => ['nullable', 'string', 'max:500'],
        ];

        if ($this->isMethod('POST')) {
            $rules['crop_listing_id'] = [
                'required',
                Rule::exists('crop_listings', 'id')->where('status', 'available'),
            ];
        }

        return $rules;
    }
}
