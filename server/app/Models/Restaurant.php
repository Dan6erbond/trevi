<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'address', 'tags', 'menuUrl', 'cuisine', 'team_id'])]
class Restaurant extends Model
{
    protected function casts(): array
    {
        return [
            'cuisine' => Cuisine::class,
            'tags' => 'array',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
