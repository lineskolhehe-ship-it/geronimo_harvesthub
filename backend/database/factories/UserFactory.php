<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'buyer',
            'phone' => '09'.fake()->numerify('#########'),
            'address' => 'Brgy. '.fake()->randomElement(['San Isidro', 'Poblacion', 'Cabawan', 'Mansasa', 'Bool']),
            'remember_token' => null,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function farmer(): static
    {
        return $this->state(fn () => ['role' => 'farmer']);
    }

    public function buyer(): static
    {
        return $this->state(fn () => ['role' => 'buyer']);
    }
}
