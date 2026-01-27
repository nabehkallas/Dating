<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Google\Cloud\Firestore\FirestoreClient;

class ProfileController extends Controller
{
    protected FirestoreClient $db;

    public function __construct()
    {
        $keyPath = storage_path('firebase_credentials.json');
        
        if (!file_exists($keyPath)) {
            $keyPath = storage_path('app/firebase_credentials.json');
        }

        $this->db = new FirestoreClient([
            'keyFilePath' => $keyPath,
            'projectId' => 'dating-2a0c5',
        ]);
    }

  public function getProfile(Request $request)
    {
        $targetUserId = $request->query('user_id');

        if (!$targetUserId) {
            $targetUserId = $request->firebase_uid;
        }

        if (!$targetUserId) {
            return response()->json(['error' => 'Unauthorized - No User ID'], 401);
        }

        try {
            $docRef = $this->db->collection('users')->document($targetUserId);
            $snapshot = $docRef->snapshot();

            if (!$snapshot->exists()) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $data = $snapshot->data();

            $preferences = null;
            if (isset($data['preferences'])) {
                $preferences = [
                    'minAge' => $data['preferences']['minAge'] ?? 18,
                    'maxAge' => $data['preferences']['maxAge'] ?? 50,
                    'maxDistance' => $data['preferences']['maxDistance'] ?? 50, 
                    'genderInterest' => $data['preferences']['genderInterest'] ?? 'everyone'
                ];
            }

            $profile = [
                'id'           => $targetUserId,
                'uid'          => $targetUserId,
                'name'         => $data['name'] ?? 'Unknown',
                'age'          => $data['age'] ?? 18,
                'bio'          => $data['bio'] ?? '',
                'gender'       => $data['gender'] ?? 'Not Specified',
                'avatar'       => $data['profileImage'] ?? ($data['avatar'] ?? 'https://placehold.co/400'), 
                'profileImage' => $data['profileImage'] ?? ($data['avatar'] ?? 'https://placehold.co/400'),
                'gallery'      => $data['gallery'] ?? [],
                'isVerified'   => $data['isVerified'] ?? false,
                'preferences'  => $preferences 
            ];

            return response()->json([
                'status' => 'success', 
                'data' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error("PROFILE ERROR: " . $e->getMessage());
            return response()->json([
                'status' => 'error', 
                'message' => $e->getMessage()
            ], 500);
        }
    }
}