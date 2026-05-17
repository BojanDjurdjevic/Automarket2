<?php

namespace App\Services;

use App\Filters\CarFilter;
use App\Models\Car;

class CarSearchService 
{
    public function search(array $filters)
    {
        try {
            $query = Car::query()
            ->with([
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

            $query = (new CarFilter)->apply($query, $filters);

            //dd($query->toSql(), $query->getBindings());

            return $query->paginate(15);
        } catch (\Throwable $e) {
            dd($e->getMessage(), $e->getTraceAsString());
        }
        
    }
}