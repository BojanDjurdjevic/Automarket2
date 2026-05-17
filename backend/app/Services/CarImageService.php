<?php

namespace App\Services;

use App\Models\Car;
use App\Models\CarImage;



use App\Traits\HandlesImageUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CarImageService
{
   use HandlesImageUpload;

   public function addImages(Car $car, array $files): void
   {
      DB::transaction(
        function() use($car,$files){

           $maxOrder = $car->images()->max('sort_order') ?? -1;

           $hasPrimary = $car->images()->where('is_primary', true)->exists();

           foreach($files as $index => $file) 
            {
              $path =$this->storeProcessedImage($file, "cars/{$car->id}");

              $car->images()->create([
                  'image_path' => $path,
                  'is_primary' =>
                     !$hasPrimary
                     && $index === 0,
                  'sort_order' =>
                     $maxOrder + 1 + $index
              ]);
           }

        }
      );
   }

   public function setPrimary(Car $car, CarImage $image): void
   {
      DB::transaction(function () use ($car, $image) {

         // reset all
         $car->images()->update([
               'is_primary' => false
         ]);

         // set new primary
         $image->update([
               'is_primary' => true
         ]);
      });
   }

   public function deleteImage(Car $car, CarImage $image, ?string $path = ''): void
   {
      if($image->car_id !== $car->id) {
         abort(404);
      }

      DB::transaction(function() use($car, $image, $path) {
         $wasPrimary =$image->is_primary;

         $path = $image->image_path;

         $image->delete();

         Storage::disk('public')->delete($path);

         if ($wasPrimary) {
            $newPrimary = $car->images()
                ->orderBy('sort_order')
                ->first();

            if ($newPrimary) {
                $newPrimary->update([
                    'is_primary' => true
                ]);
            }
        }

      });

      $this->deleteImageFile(
         $path
      );
   }
}