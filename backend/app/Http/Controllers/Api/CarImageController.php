<?php

namespace App\Http\Controllers\Api;

use App\Models\Car;
use App\Models\CarImage;

use App\Services\CarImageService;

use App\Http\Requests\StoreCarImageRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CarImageController 
{
   public function __construct(
      protected CarImageService $imageService
   ) {}

   public function store(StoreCarImageRequest $request, Car $car) 
    {
        Gate::authorize('create', $car);

        $this->imageService->addImages($car, $request->file('images'));

        return response()->json([
            'message' =>
            'Images are successfully uploaded.'
        ]);
    }

    /*
    public function setPrimary(Car $car, CarImage $image)
    {
        if ($image->car_id !== $car->id) {
            abort(404);
        }

        Gate::authorize('update', $car);

        DB::transaction(function () use ($car, $image) {

            $car->images()->update([
                'is_primary' => false
            ]);

            $image->update([
                'is_primary' => true
            ]);
        });

        return response()->json([
            'message' => 'Primary image updated'
        ]);
    } */

    // Logic moved into Service

    public function setPrimary(Car $car, CarImage $image)
    {
        if ($image->car_id !== $car->id) {
            abort(404);
        }

        Gate::authorize('update', $car);

        $this->imageService->setPrimary(
            $car,
            $image
        );

        return response()->json([
            'message' => 'Primary image updated'
        ]);
    }

    public function destroy(Car $car, CarImage $image)
    {
        Gate::authorize('delete', $car);

        $this->imageService->deleteImage($car, $image);

        return response()->json([
            'message' =>
            'Image is successfully deleted.'
        ]);
    }
}