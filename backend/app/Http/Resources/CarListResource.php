<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CarListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'price' => $this->price,
            'year' => $this->year,
            'mileage' => $this->mileage,
            'location' => $this->location,

            'make' => $this->make?->name,
            'model' => $this->model?->name,
            'fuel_type' => [
                'id' => $this->fuelType?->id,
                'name' => $this->fuelType?->name,
            ],

            'image' => $this->primaryImage
            ? Storage::disk('public')->url($this->primaryImage->image_path)
            : null,
            
            'user_id' => $this->user_id,

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
