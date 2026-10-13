<?php

namespace App\Http\Requests;

use App\Models\Crop;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CropRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin middleware guards the routes
    }

    public function rules(): array
    {
        $crop = $this->route('crop');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('crops', 'name')->ignore($crop?->id)],
            'category' => ['required', Rule::in(Crop::CATEGORIES)],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
