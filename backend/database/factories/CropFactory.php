<?php

namespace Database\Factories;

use App\Models\Crop;
use Illuminate\Database\Eloquent\Factories\Factory;

class CropFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Tomato', 'Eggplant', 'Okra', 'Cabbage', 'Pechay', 'Sweet Potato', 'Banana (Saba)', 'Calamansi',
            ]),
            'category' => fake()->randomElement(Crop::CATEGORIES),
            'description' => 'Locally grown and sold fresh.',
        ];
    }
}
