<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantRequest;
use App\Models\Restaurant;
use App\Models\Team;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Team $team)
    {
        return QueryBuilder::for(
            $team->restaurants()
                ->withMax('visits', 'visited_at')
                ->withAvg('visits', 'cost')
                ->withAvg('visits', 'party_size')
                ->withAvg('visits', DB::raw('cost / party_size'))
        )
            ->allowedIncludes('team')
            ->jsonPaginate();
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
        return QueryBuilder::for(
            Restaurant::whereId($restaurant->id)
                ->withMax('visits', 'visited_at')
                ->withAvg('visits', 'cost')
                ->withAvg('visits', 'party_size')
                ->withAvg('visits', DB::raw('cost / party_size'))
                ->withAvg('reviews', 'rating')
        )
            ->allowedIncludes('visits', 'visits.reviews', 'visits.reviews.author')
            ->first();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRestaurantRequest $request, Team $team, Restaurant $restaurant)
    {
        $restaurant->update([
            'name' => $request['name'],
            'address' => $request['address'],
            'menuUrl' => $request['menuUrl'],
            'cuisine' => $request['cuisine'],
            'tags' => $request['tags'],
        ]);

        return $restaurant;
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
