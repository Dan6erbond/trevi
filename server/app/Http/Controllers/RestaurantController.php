<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantRequest;
use App\Models\Restaurant;
use App\Models\Team;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Team $team)
    {
        return QueryBuilder::for($team->restaurants())
            ->allowedIncludes('team')
            ->jsonPaginate();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRestaurantRequest $request, Team $team)
    {
        $restaurant = Restaurant::create([
            'team_id' => $team->id,
            'name' => $request['name'],
            'address' => $request['address'],
            'menuUrl' => $request['menuUrl'],
            'cuisine' => $request['cuisine'],
            'tags' => $request['tags'],
        ]);

        return $restaurant;
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team, Restaurant $restaurant)
    {
        return QueryBuilder::for(Restaurant::where('id', $restaurant->id))
            ->allowedIncludes('visits')
            ->first();
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Restaurant $restaurant)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRestaurantRequest $request, Team $team, Restaurant $restaurant)
    {
        return $restaurant->update([
            'name' => $request['name'],
            'address' => $request['address'],
            'menuUrl' => $request['menuUrl'],
            'cuisine' => $request['cuisine'],
            'tags' => $request['tags'],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team, Restaurant $restaurant)
    {
        $restaurant->delete();

        return [
            'success' => 'true'
        ];
    }
}
