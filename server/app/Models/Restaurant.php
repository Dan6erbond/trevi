<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string|null $address
 * @property string|null $menu_url
 * @property \App\Models\Cuisine|null $cuisine
 * @property array<array-key, mixed> $tags
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $google_maps_embed
 * @property string|null $reservation
 * @property bool $parking_available
 * @property bool $dog_friendly
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Review> $reviews
 * @property-read int|null $reviews_count
 * @property-read \App\Models\Team|null $team
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Visit> $visits
 * @property-read int|null $visits_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereCuisine($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereDogFriendly($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereGoogleMapsEmbed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereMenuUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereParkingAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereReservation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereTags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Restaurant whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable(['name', 'address', 'tags', 'dog_friendly', 'parking_available', 'google_maps_embed', 'reservation', 'menu_url', 'cuisine', 'team_id'])]
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

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function reviews()
    {
        return $this->hasManyThrough(
            Review::class,
            Visit::class
        );
    }
}
