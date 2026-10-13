<?php

namespace Database\Factories;

use App\Models\CropListing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BuyerRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'buyer_id' => User::factory()->buyer(),
            'crop_listing_id' => CropListing::factory(),
            'requested_quantity' => fake()->numberBetween(5, 40),
            'message' => fake()->randomElement([
                'Good day! I would like to pick this up on Saturday morning.',
                'Can you deliver to the public market? Thank you.',
                'I need this for my restaurant this weekend.',
                'Please confirm if the produce is still fresh.',
                null,
            ]),
            'status' => fake()->randomElement(['pending', 'pending', 'approved', 'rejected', 'completed', 'cancelled']),
        ];
    }
}
