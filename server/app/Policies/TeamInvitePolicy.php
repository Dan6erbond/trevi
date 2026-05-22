<?php

namespace App\Policies;

use App\Models\TeamInvite;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TeamInvitePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TeamInvite $teamInvite): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TeamInvite $teamInvite): bool
    {
        return false;
    }

    /**
     * Determine whether the user can accept the model.
     */
    public function accept(User $user, TeamInvite $teamInvite): bool
    {
        // TODO: In a real-world application we would also check if the user email is verified
        return $teamInvite->email == $user->email;
    }

    /**
     * Determine whether the user can reject the model.
     */
    public function reject(User $user, TeamInvite $teamInvite): bool
    {
        // TODO: In a real-world application we would also check if the user email is verified
        return $teamInvite->email == $user->email;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TeamInvite $teamInvite): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TeamInvite $teamInvite): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TeamInvite $teamInvite): bool
    {
        return false;
    }
}
