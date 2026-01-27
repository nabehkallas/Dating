<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirebaseTestController;
use App\Http\Controllers\FirestoreTestController;


Route::get('/test-grpc', [FirestoreTestController::class, 'testConnection']);

Route::get('/', function () {
    return view('welcome');
});
Route::get('/firebase-test', [FirebaseTestController::class, 'testRead']);