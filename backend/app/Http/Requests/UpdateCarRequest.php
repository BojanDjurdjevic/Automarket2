<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCarRequest extends CarBaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
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
