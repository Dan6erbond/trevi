<?php

namespace App\Http\Requests;

use App\Models\Cuisine;
use App\Models\Restaurant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRestaurantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Restaurant::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required'],
            'address' => ['sometimes'],
            'menuUrl' => ['sometimes', 'url'],
            'cuisine' => [Rule::enum(Cuisine::class)],
            'tags' => ['list'],
        ];
    }
}
