<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamInviteRequest;
use App\Models\Team;
use App\Models\TeamInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;

class TeamInviteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Team $team)
    {
        return QueryBuilder::for($team->invites())
            ->allowedIncludes('createdBy')
            ->jsonPaginate();
    }

    /**
     * Display a listing of the resource for the user.
     */
    public function userIndex()
    {
        return QueryBuilder::for(
            TeamInvite::query()->where('email', Auth::user()->email),
        )
            ->allowedIncludes('createdBy')
            ->jsonPaginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamInviteRequest $request, Team $team)
    {
        $invite = TeamInvite::create([
            'team_id' => $team->id,
            'email' => $request['email'],
            'created_by_id' => Auth::user()->id,
        ]);

        return $invite;
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team, TeamInvite $invite)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team, TeamInvite $invite)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team, TeamInvite $invite)
    {
        logger()->info('TeamInviteController.destroy', [
            'team' => $team->id,
            'invite' => $invite->id,
        ]);

        $invite->delete();

        return [
            'success' => 'true'
        ];
    }
}
