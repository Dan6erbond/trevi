<?php

namespace App\Http\Requests;

use App\Models\Cuisine;
use App\Models\Reservation;
use App\Models\Restaurant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRestaurantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('restaurant'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes'],
            'address' => ['sometimes', 'nullable'],
            'menuUrl' => ['sometimes', 'nullable', 'url'],
            'cuisine' => ['sometimes', 'nullable', Rule::enum(Cuisine::class)],
            'tags' => ['sometimes', 'list'],
            'googleMapsEmbed' => ['sometimes', 'nullable', 'url'],
            'reservation' => ['sometimes', 'nullable', Rule::enum(Reservation::class)],
            'parkingAvailable' => ['boolean'],
            'dogFriendly' => ['boolean'],
        ];
    }
}
