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
      $paths = [];
      try {
        DB::transaction(
        function() use($car,$files, &$paths){
           Car::whereKey($car->id)->lockForUpdate()->firstOrFail();

           $maxOrder = $car->images()->max('sort_order') ?? -1;

           $hasPrimary = $car->images()->where('is_primary', true)->exists();

           foreach(array_values($files) as $index => $file)
            {
              $path =$this->storeProcessedImage($file, "cars/{$car->id}");
              $paths[] = $path;

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
      } catch (\Throwable $e) {
          foreach ($paths as $path) {
              try {
                  $this->deleteImageFile($path);
              } catch (\Throwable $cleanupException) {
                  report($cleanupException);
              }
          }
          throw $e;
      }
   }

   public function setPrimary(Car $car, CarImage $image): void
   {
      DB::transaction(function () use ($car, $image) {
         Car::whereKey($car->id)->lockForUpdate()->firstOrFail();
         $image = $car->images()->whereKey($image->id)->firstOrFail();

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

   public function deleteImage(Car $car, CarImage $image): void
   {
      if($image->car_id !== $car->id) {
         abort(404);
      }

      DB::transaction(function() use($car, $image) {
         Car::whereKey($car->id)->lockForUpdate()->firstOrFail();
         $image = $car->images()->whereKey($image->id)->firstOrFail();
         $wasPrimary =$image->is_primary;

         $path = $image->image_path;

         $image->delete();

         if ($wasPrimary) {
            $newPrimary = $car->images()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->first();

            if ($newPrimary) {
                $newPrimary->update([
                    'is_primary' => true
                ]);
            }
        }

         DB::afterCommit(function () use ($path) {
            try {
               $this->deleteImageFile($path);
            } catch (\Throwable $cleanupException) {
               report($cleanupException);
            }
         });
      });
   }

   public function deleteAllImages(Car $car): void
   {
      $folder = "cars/{$car->id}";
      DB::transaction(function () use ($car, $folder) {
          $car->images()->delete();
          DB::afterCommit(function () use ($folder) {
              try {
                  if (! Storage::disk('public')->deleteDirectory($folder)) {
                      report(new \RuntimeException('Unable to delete car images.'));
                  }
              } catch (\Throwable $cleanupException) {
                  report($cleanupException);
              }
          });
      });
   }
}
