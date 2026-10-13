<?php

namespace App\Http\Requests;

use App\Models\HarvestRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HarvestRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policies are checked in the controller
    }

    public function rules(): array
    {
        return [
            'crop_id' => ['required', 'exists:crops,id'],
            'expected_quantity' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'actual_quantity' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'unit' => ['required', 'string', 'max:20'],
            'harvest_date' => ['required', 'date'],
            'status' => ['required', Rule::in(HarvestRecord::STATUSES)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
