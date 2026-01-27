<?php

namespace App\Http\Controllers;

// Correct namespace for the bensontrent/firestore-php package
use MrShan0\PHPFirestore\FirestoreClient;

class FirebaseTestController extends Controller{
public function testRead()
{
    try {
        $projectId = 'dating-2a0c5'; 
        $apiKey = 'AIzaSyBko5STROB2OOn2ULiYa8xkK5Dx6khvkno'; 

        $firestore = new \MrShan0\PHPFirestore\FirestoreClient($projectId, $apiKey);

        // 1. Get a specific document
        // Replace 'user1' with the actual document ID you want to read
        $doc = $firestore->getDocument('users/1Ujr92RFy3D3hb3uRT40');

        return response()->json([
            'status' => 'Success!',
            'engine' => 'REST (Object Handled)',
            'user'   => [
                'id'   => basename($doc->getName()),
                'data' => $doc->toArray(),
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}
}