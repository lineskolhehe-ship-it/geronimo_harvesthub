<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin middleware guards the routes
    }

    public function rules(): array
    {
        $user = $this->route('user');
        $creating = $this->isMethod('POST');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['required', Rule::in(User::ROLES)],
            'password' => [$creating ? 'required' : 'nullable', Password::min(8)],
        ];
    }
}
