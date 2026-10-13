<?php

namespace Database\Factories;

use App\Models\Crop;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CropListingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farmer_id' => User::factory()->farmer(),
            'crop_id' => Crop::factory(),
            'harvest_record_id' => null,
            'available_quantity' => fake()->numberBetween(20, 500),
            'unit' => 'kg',
            'price_per_unit' => fake()->randomFloat(2, 15, 180),
            'harvest_date' => fake()->dateTimeBetween('-14 days', '+14 days')->format('Y-m-d'),
            'status' => fake()->randomElement(['available', 'available', 'available', 'sold_out']),
            'description' => fake()->randomElement([
                'Freshly harvested, no chemical pesticides.',
                'Grown organically on our family farm.',
                'Sorted and ready for pickup or delivery.',
                'Good for retail and restaurant supply.',
            ]),
        ];
    }
}
