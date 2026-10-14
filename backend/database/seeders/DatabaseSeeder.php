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
        $place = 'Brgy. Pooc Oriental, Tubigon';

        // ---- Demo accounts (password for all: "password") ----
        User::factory()->admin()->create([
            'name' => 'Ramon Aguilar',
            'email' => 'admin@harvest.test',
            'phone' => '09171234567',
            'address' => "FarmniBai Office, {$place}",
        ]);

        $farmerData = [
            ['Roberto Dela Cruz', 'farmer@harvest.test'],
            ['Marites Cabahug', 'marites.cabahug@harvest.test'],
            ['Ernesto Bongcaras', 'ernesto.bongcaras@harvest.test'],
            ['Luzviminda Galos', 'luz.galos@harvest.test'],
            ['Teodoro Abella', 'teodoro.abella@harvest.test'],
        ];
        $farmers = collect($farmerData)->map(fn ($f) => User::factory()->farmer()->create([
            'name' => $f[0],
            'email' => $f[1],
            'address' => $place,
        ]));

        $buyerData = [
            ['Josefina Mercado', 'buyer@harvest.test', 'Stall 14, Tubigon Public Market'],
            ['Antonio Reyes', 'antonio.reyes@harvest.test', 'Reyes Family Eatery, Tubigon'],
            ['Carmelita Bautista', 'carmen.bautista@harvest.test', 'Bautista Fresh Produce, Tubigon'],
            ['Dennis Soriano', 'dennis.soriano@harvest.test', 'Soriano Catering Services, Tubigon'],
        ];
        $buyers = collect($buyerData)->map(fn ($b) => User::factory()->buyer()->create([
            'name' => $b[0],
            'email' => $b[1],
            'address' => $b[2],
        ]));

        // ---- Crop catalog: name, category, description, typical price range (PHP per kg) ----
        // Keep Tomato first: the Postman collection uses crop_id 1.
        $catalog = [
            ['Tomato', 'Vegetables', 'Red, firm tomatoes for salads and cooking.', 40, 70],
            ['Eggplant', 'Vegetables', 'Long purple eggplant (talong).', 45, 70],
            ['Okra', 'Vegetables', 'Tender green okra pods.', 40, 60],
            ['Ampalaya', 'Vegetables', 'Bitter gourd, harvested young.', 60, 90],
            ['Squash', 'Vegetables', 'Kalabasa, good for soups and stews.', 25, 40],
            ['Cabbage', 'Vegetables', 'Compact green cabbage heads.', 50, 80],
            ['Pechay', 'Vegetables', 'Native pechay, leafy and fresh.', 40, 60],
            ['String Beans', 'Legumes', 'Sitaw, long and tender.', 60, 90],
            ['Mung Beans', 'Legumes', 'Dried mung beans (monggo).', 120, 160],
            ['Sweet Potato', 'Root Crops', 'Camote, orange and purple varieties.', 30, 45],
            ['Cassava', 'Root Crops', 'Fresh cassava roots.', 20, 30],
            ['Taro', 'Root Crops', 'Gabi, medium to large corms.', 40, 60],
            ['Banana (Saba)', 'Fruits', 'Cooking bananas sold per kilo.', 25, 40],
            ['Mango (Carabao)', 'Fruits', 'Sweet carabao mangoes.', 80, 140],
            ['Pineapple', 'Fruits', 'Sweet, ripe pineapples.', 30, 50],
            ['Calamansi', 'Fruits', 'Small citrus fruit used in cooking and drinks.', 60, 100],
            ['Native Corn', 'Grains', 'White native corn, fresh or dried.', 25, 40],
            ['Rice (Palay)', 'Grains', 'Unmilled rice sold by the kilo.', 18, 24],
            ['Ginger', 'Herbs & Spices', 'Fresh ginger roots.', 100, 160],
            ['Ube', 'Root Crops', 'Purple yam, popular for sweets and desserts.', 80, 140],
            ['Malunggay', 'Vegetables', 'Fresh moringa leaves and pods.', 50, 80],
        ];

        $prices = [];
        $crops = collect($catalog)->map(function ($c) use (&$prices) {
            $prices[$c[0]] = [$c[3], $c[4]];

            return Crop::create([
                'name' => $c[0],
                'category' => $c[1],
                'description' => $c[2],
            ]);
        });

        // ---- Harvest records (30) ----
        HarvestRecord::factory()->count(30)->state(fn () => [
            'farmer_id' => $farmers->random()->id,
            'crop_id' => $crops->random()->id,
        ])->create();

        // ---- Crop listings (26). About 60% come from one of the farmer's harvest records ----
        $descriptions = [
            'Freshly harvested in Pooc Oriental, no chemical pesticides.',
            'Grown on our family farm in Tubigon.',
            'Sorted and ready for pickup at the farm or delivery to the public market.',
            'Good for retail and restaurant supply.',
        ];

        $listings = CropListing::factory()->count(26)->state(function () use ($farmers, $crops, $prices, $descriptions) {
            $farmer = $farmers->random();
            $record = HarvestRecord::where('farmer_id', $farmer->id)->inRandomOrder()->first();
            $useRecord = $record && fake()->boolean(60);
            $crop = $useRecord ? $record->crop : $crops->random();
            [$min, $max] = $prices[$crop->name];

            return [
                'farmer_id' => $farmer->id,
                'crop_id' => $crop->id,
                'harvest_record_id' => $useRecord ? $record->id : null,
                'price_per_unit' => fake()->numberBetween($min, $max),
                'description' => fake()->randomElement($descriptions),
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
