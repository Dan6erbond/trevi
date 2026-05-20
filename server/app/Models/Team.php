<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Team extends Model
{
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_memberships');
    }

    public function isMember(User $user): bool
    {
        return $this->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function admins()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('is_admin')
            ->wherePivot('is_admin', true);
    }

    public function isAdmin(User $user): bool
    {
        return $this->admins()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class);
    }
}
