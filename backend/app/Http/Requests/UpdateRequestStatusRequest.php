<?php

namespace App\Http\Requests;

use App\Models\BuyerRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Transition rules are enforced in the controller
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(BuyerRequest::STATUSES)],
        ];
    }
}
