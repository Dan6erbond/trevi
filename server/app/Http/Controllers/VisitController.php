<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitRequest;
use App\Models\Restaurant;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;

class VisitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Restaurant $restaurant)
    {
        return QueryBuilder::for($restaurant->visits())->jsonPaginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVisitRequest $request, Restaurant $restaurant)
    {
        logger()->info('VisitController.store', [
            'user' => Auth::user(),
            'restaurant' => $restaurant,
            'request' => $request,
        ]);

        $visit = Visit::create([
            'restaurant_id' => $restaurant->id,
            'title' => $request['title'],
            'visited_at' => $request['visitedAt'],
            'cost' => $request['cost'],
            'party_size' => $request['partySize'],
        ]);

        return $visit;
    }

    /**
     * Display the specified resource.
     */
    public function show(Restaurant $restaurant, Visit $visit)
    {
        return QueryBuilder::for(Visit::whereId($visit->id))->first();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Restaurant $restaurant, Visit $visit)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Restaurant $restaurant, Visit $visit)
    {
        $restaurant->delete();

        return [
            'success' => 'true'
        ];
    }
}
