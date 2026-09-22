<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            FuelTypeSeeder::class,
            TransmissionSeeder::class,
            BodyTypeSeeder::class,
            FeatureSeeder::class,

            CarMakeSeeder::class,
            CarModelSeeder::class,
        ]);

        if (app()->environment('production')) {
            return;
        }

        User::factory(10)->create();

        Car::factory(50)->create();
    }
}
