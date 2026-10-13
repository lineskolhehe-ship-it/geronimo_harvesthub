<?php

namespace Database\Factories;

use App\Models\Crop;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HarvestRecordFactory extends Factory
{
    public function definition(): array
    {
        $expected = fake()->numberBetween(60, 800);
        $status = fake()->randomElement(['planned', 'harvested', 'harvested', 'listed']);

        return [
            'farmer_id' => User::factory()->farmer(),
            'crop_id' => Crop::factory(),
            'expected_quantity' => $expected,
            'actual_quantity' => $status === 'planned' ? null : round($expected * fake()->randomFloat(2, 0.8, 1.05), 2),
            'unit' => 'kg',
            'harvest_date' => fake()->dateTimeBetween('-60 days', '+30 days')->format('Y-m-d'),
            'status' => $status,
            'notes' => fake()->randomElement([
                'Good yield this season.',
                'Some losses due to heavy rain.',
                'Harvested early morning to keep produce fresh.',
                'Second picking of the season.',
                null,
            ]),
        ];
    }
}
