<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $email
 * @property int $created_by_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $team_id
 * @property string|null $rejected_at
 * @property string|null $accepted_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Team $team
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereAcceptedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereCreatedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereRejectedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TeamInvite whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable('team_id', 'email', 'created_by_id')]
class TeamInvite extends Model
{
    use HasUuids;

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
