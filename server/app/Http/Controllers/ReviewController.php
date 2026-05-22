<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Visit $visit)
    {
        return QueryBuilder::for($visit->reviews())->jsonPaginate();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Visit $visit, StoreReviewRequest $request)
    {
        $review = Review::create([
            'visit_id' => $visit->id,
            'rating' => $request['rating'],
            'review' => $request['review'],
            'author_id' => Auth::user()->id,
        ]);

        return $review;
    }

    /**
     * Display the specified resource.
     */
    public function show(Visit $visit, Review $review)
    {
        return QueryBuilder::for(Review::whereId($review->id))->first();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Visit $visit, Review $review)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Visit $visit, Review $review)
    {
        $review->delete();

        return [
            'success' => 'true'
        ];
    }
}
