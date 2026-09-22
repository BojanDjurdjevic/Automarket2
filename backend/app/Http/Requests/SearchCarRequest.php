<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SearchCarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:128',
            'page' => 'nullable|integer|min:1',
            'make_id' => 'nullable|integer|exists:car_makes,id',
            'model_id' => 'nullable|integer|exists:car_models,id',

            'fuel_type_id' => 'nullable|integer|exists:fuel_types,id',
            'body_type_id' => 'nullable|integer|exists:body_types,id',
            'transmission_id' => 'nullable|integer|exists:transmissions,id',

            'price_min' => 'nullable|integer|min:0',
            'price_max' => 'nullable|integer|min:0'.($this->filled('price_min') ? '|gte:price_min' : ''),

            'year_min' => 'nullable|integer|min:1950|max:' . now()->year,
            'year_max' => 'nullable|integer|min:1950|max:' . now()->year.($this->filled('year_min') ? '|gte:year_min' : ''),

            'mileage_max' => 'nullable|integer|min:0',

            'sort_by' => 'nullable|in:price,year,mileage,created_at',
            'sort_dir' => 'nullable|in:asc,desc',
        ];
    }
}
