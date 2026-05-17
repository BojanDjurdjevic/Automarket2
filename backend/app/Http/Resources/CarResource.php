<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'price' => $this->price,
            'year' => $this->year,

            'make' => [
                'id' => $this->make?->id,
                'name' => $this->make?->name,
            ], 

            'model' => [
                'id' => $this->model?->id,
                'name' => $this->model?->name
            ],

            'fuel_type' => [
                'id' => $this->fuelType?->id,
                'name' => $this->fuelType?->name
            ],

            'transmission' => [
                'id' => $this->transmission?->id,
                'name' => $this->transmission?->name
            ],

            'body_type' => [
                'id' => $this->bodyType?->id,
                'name' => $this->bodyType?->name
            ],

            'mileage' => $this->mileage,
            'engine_size' => (float) $this->engine_size,
            'horsepower' => $this->horsepower,
            'color' => $this->color,
            'description' => $this->description,
            'location' => $this->location,
            'slug' => $this->slug,
            
            'status' => [
                'value' => $this->status,
                'label' => ucfirst($this->status),
            ],

            'features' => $this->features->map(fn($f) => [
                'id' => $f->id,
                'name' => $f->name
            ]),

            'images' => $this->images->map(fn($img) => [
                'id' => $img->id,
                'url' => asset('storage/' . $img->image_path),
                'is_primary' => (bool) $img->is_primary,
            ]),
            /*
            'owner' => [
                'name' => $this->user?->name,
                'city' => $this->user?->city,
                'email' => $this->user?->email,
                'phone' => $this->user?->phone
            ], */

            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'city' => $this->user?->city,
                'email' => $this->user?->email,
                'phone' => $this->user?->phone,
            ],
        ];
    }
}
