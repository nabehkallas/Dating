<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\SwipeController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\StoryController;

use Google\Cloud\Firestore\FirestoreClient;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FirestoreTestController;


Route::middleware(['auth.firebase'])->group(function () {
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/feed', [FeedController::class, 'index']);
Route::post('/swipe', [SwipeController::class, 'store']);
Route::get('/matches/pending', [MatchController::class, 'getPendingLikes']);
Route::get('/matches', [MatchController::class, 'getMatches']);
Route::get('/stories/feed', [StoryController::class, 'getStoriesFeed']);
Route::post('/stories', [StoryController::class, 'store']);
Route::get('/profile', [ProfileController::class, 'getProfile']);
Route::get('/firestore/fix-data', [FirestoreTestController::class, 'normalizeLikesData']);
});