<?php

namespace App\Http\Requests;

use App\Models\Visit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVisitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Visit::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required'],
            'visitedAt' => ['required', 'date'],
            'cost' => ['required', 'decimal:0,2'],
            'partySize' => ['required', 'integer'],
        ];
    }
}
