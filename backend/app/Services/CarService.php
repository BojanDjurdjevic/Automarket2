<?php

namespace App\Services;

use App\Models\Car;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CarService
{
    protected function syncFeatures(Car $car, array $featureIds): void
    {
        $car->features()->sync($featureIds);
    }

    protected function storeImages(Car $car, array $images): void
    {
        app(CarImageService::class)->addImages($car, $images);
    }

    public function createListing(array $data, ?array $images = null): Car
    {
        return DB::transaction(
            function () use ($data, $images) {
                $featureIds = $data['features'] ?? [];
                
                unset($data['features'], $data['images']);
                
                $data['user_id'] = auth()->id();

                $data['slug'] = Str::slug($data['title'] . '-' . uniqid());

                $car = Car::create($data);

                if($featureIds) {
                    $this->syncFeatures($car, $featureIds);
                }

                if ($images) {
                    $this->storeImages($car, $images);
                }

                return $car;
            }
        );
    }

    public function updateListing(Car $car, array $data, ?array $images = null)
    {
        return DB::transaction(
            function() use($car, $data, $images) {
                $car = Car::whereKey($car->id)->lockForUpdate()->firstOrFail();
                $featureIds = $data['features'] ?? [];

                if(array_key_exists('features', $data)) {
                    $this->syncFeatures(
                        $car,
                        $featureIds
                    );
                }

                unset($data['features'], $data['images']);

                if(isset($data['title'])) $data['slug'] = Str::slug($data['title'] . '-' . uniqid());
                
                $car->update($data);

                if ($images) {
                    $this->storeImages($car, $images);
                }

                return $car->load([
                    'make',
                    'model',
                    'fuelType',
                    'bodyType',
                    'transmission',
                    'features',
                    'images',
                    'primaryImage',
                    'user'
                ]);
            }
        );
    }

    public function deleteListing(Car $car): void
    {
        DB::transaction(function() use($car){
            $car = Car::whereKey($car->id)->lockForUpdate()->firstOrFail();
            $car->features()->detach();
            $car->delete();
            app(CarImageService::class)->deleteAllImages($car);
        });
    }
}
