<?php

namespace Database\Seeders;

use App\Models\BuyerRequest;
use App\Models\Crop;
use App\Models\CropListing;
use App\Models\HarvestRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Demo accounts (password for all: "password") ----
        User::factory()->admin()->create([
            'name' => 'Ramon Aguilar', 'email' => 'admin@harvest.test',
            'phone' => '09171234567', 'address' => 'Cooperative Office, Brgy. Poblacion',
        ]);

        $farmerData = [
            ['Roberto Dela Cruz', 'farmer@harvest.test', 'Brgy. San Isidro'],
            ['Maria Santos', 'maria.santos@harvest.test', 'Brgy. Cabawan'],
            ['Ernesto Villanueva', 'ernesto.v@harvest.test', 'Brgy. Mansasa'],
            ['Luzviminda Ramos', 'luz.ramos@harvest.test', 'Brgy. Bool'],
            ['Teodoro Abella', 'teodoro.a@harvest.test', 'Brgy. San Isidro'],
        ];
        $farmers = collect($farmerData)->map(fn ($f) => User::factory()->farmer()->create([
            'name' => $f[0], 'email' => $f[1], 'address' => $f[2],
        ]));

        $buyerData = [
            ['Josefina Mercado', 'buyer@harvest.test', 'Public Market Stall 14'],
            ['Antonio Reyes', 'antonio.reyes@harvest.test', 'Reyes Family Restaurant'],
            ['Carmelita Bautista', 'carmen.b@harvest.test', 'Bautista Fresh Produce'],
            ['Dennis Soriano', 'dennis.s@harvest.test', 'Soriano Catering Services'],
        ];
        $buyers = collect($buyerData)->map(fn ($b) => User::factory()->buyer()->create([
            'name' => $b[0], 'email' => $b[1], 'address' => $b[2],
        ]));

        // ---- Crop catalog ----
        $catalog = [
            ['Tomato', 'Vegetables', 'Red, firm tomatoes for salads and cooking.'],
            ['Eggplant', 'Vegetables', 'Long purple eggplant (talong).'],
            ['Okra', 'Vegetables', 'Tender green okra pods.'],
            ['Ampalaya', 'Vegetables', 'Bitter gourd, harvested young.'],
            ['Squash', 'Vegetables', 'Kalabasa, good for soups and stews.'],
            ['Cabbage', 'Vegetables', 'Compact green cabbage heads.'],
            ['Pechay', 'Vegetables', 'Native pechay, leafy and fresh.'],
            ['String Beans', 'Legumes', 'Sitaw, long and tender.'],
            ['Mung Beans', 'Legumes', 'Dried mung beans (monggo).'],
            ['Sweet Potato', 'Root Crops', 'Camote, orange and purple varieties.'],
            ['Cassava', 'Root Crops', 'Fresh cassava roots.'],
            ['Taro', 'Root Crops', 'Gabi, medium to large corms.'],
            ['Banana (Saba)', 'Fruits', 'Cooking bananas sold per kilo.'],
            ['Mango (Carabao)', 'Fruits', 'Sweet carabao mangoes.'],
            ['Pineapple', 'Fruits', 'Sweet, ripe pineapples.'],
            ['Calamansi', 'Fruits', 'Small citrus fruit used in cooking and drinks.'],
            ['Native Corn', 'Grains', 'White native corn, fresh or dried.'],
            ['Rice (Palay)', 'Grains', 'Unmilled rice sold by the sack.'],
            ['Ginger', 'Herbs & Spices', 'Fresh ginger roots.'],
        ];
        $crops = collect($catalog)->map(fn ($c) => Crop::create([
            'name' => $c[0], 'category' => $c[1], 'description' => $c[2],
        ]));

        // ---- Harvest records (30) ----
        HarvestRecord::factory()->count(30)->state(fn () => [
            'farmer_id' => $farmers->random()->id,
            'crop_id' => $crops->random()->id,
        ])->create();

        // ---- Crop listings (26), some linked to a harvest record ----
        $listings = CropListing::factory()->count(26)->state(function () use ($farmers, $crops) {
            $farmer = $farmers->random();
            $record = HarvestRecord::where('farmer_id', $farmer->id)->inRandomOrder()->first();

            return [
                'farmer_id' => $farmer->id,
                'crop_id' => $record && fake()->boolean(60) ? $record->crop_id : $crops->random()->id,
                'harvest_record_id' => $record && fake()->boolean(60) ? $record->id : null,
            ];
        })->create();

        // ---- Buyer requests (30) ----
        BuyerRequest::factory()->count(30)->state(function () use ($buyers, $listings) {
            $listing = $listings->random();

            return [
                'buyer_id' => $buyers->random()->id,
                'crop_listing_id' => $listing->id,
                'requested_quantity' => min(fake()->numberBetween(5, 40), max((int) $listing->available_quantity, 1)),
            ];
        })->create();
    }
}
