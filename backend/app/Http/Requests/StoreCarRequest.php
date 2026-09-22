<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCarRequest extends CarBaseRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return array_merge(
            $this->carRules(),
            [
                'features' => 'nullable|array',

                'features.*' => 'integer|distinct|exists:features,id',

                'images' => 'nullable|array|max:10',

                'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120'
            ]
        );
        
    }
}
