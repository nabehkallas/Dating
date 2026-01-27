<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Google\Cloud\Firestore\FirestoreClient;

class SwipeController extends Controller
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

    public function store(Request $request)
    {
        $currentUserId = $request->firebase_uid;

        if (!$currentUserId) $currentUserId = $request->input('user_id');       

        $targetUserId = $request->input('swiped_user_id'); 
        $direction = $request->input('direction');        

        if (!$currentUserId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$targetUserId || !$direction) {
            return response()->json(['error' => 'Missing fields'], 400);
        }

        try {
            $swipeData = [
                'direction' => $direction,     
                'swipedBy'  => $currentUserId, 
                'swipedOn'  => $targetUserId,  
                'timestamp' => date('Y-m-d H:i:s') 
            ];

            $this->db->document("users/$currentUserId/swipes/$targetUserId")
                ->set($swipeData);

            try {
                $this->db->document("users/$currentUserId/received_likes/$targetUserId")
                    ->delete();
            } catch (\Exception $e) {
            }

            $isMatch = false;

            if ($direction === 'right' || $direction === 'super') {
                
                try {
                    $reverseDoc = $this->db->document("users/$targetUserId/swipes/$currentUserId")->snapshot();

                    if ($reverseDoc->exists()) {
                        $reverseData = $reverseDoc->data();
                        
                        if (isset($reverseData['direction']) && 
                           ($reverseData['direction'] === 'right' || $reverseData['direction'] === 'super')) {
                            
                            $isMatch = true;
                            
                            $this->createMatchRecord($currentUserId, $targetUserId);

                            try {
                                $this->db->document("users/$targetUserId/received_likes/$currentUserId")->delete();
                            } catch (\Exception $e) { }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Error checking match: " . $e->getMessage());
                    $isMatch = false; 
                }

                if (!$isMatch) {
                    try {
                        $myProfile = $this->fetchUserProfile($currentUserId);
                        $visibility = $myProfile['visibility'] ?? 'public'; 
                        $isPrivate = ($visibility === 'private');

                        $myAvatar = $myProfile['avatar'] ?? '';

                        $receivedLikeData = [
                            'uid'       => $currentUserId,
                            'name'      => $myProfile['name'] ?? 'Unknown',
                            'age'       => $myProfile['age'] ?? 18,
                            'avatar'    => $myAvatar, 
                            'type'      => $direction,
                            'timestamp' => date('Y-m-d H:i:s'),
                            'isPrivate' => $isPrivate
                        ];

                        $this->db->document("users/$targetUserId/received_likes/$currentUserId")
                            ->set($receivedLikeData);

                    } catch (\Exception $e) {
                        Log::error("Failed to update received_likes: " . $e->getMessage());
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'match' => $isMatch,
                'swipedOn' => $targetUserId
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function createMatchRecord($user1Id, $user2Id)
    {
        $user1Data = $this->fetchUserProfile($user1Id);
        $user2Data = $this->fetchUserProfile($user2Id);

        $ids = [$user1Id, $user2Id];
        sort($ids);
        $matchId = $ids[0] . '_' . $ids[1];

        $avatar1 = $user1Data['avatar'] ??  'https://placehold.co/200/png';
        $avatar2 = $user2Data['avatar'] ??  'https://placehold.co/200/png';

        $matchData = [
            'users' => [$user1Id, $user2Id],
            'lastMessage' => "It's a match!",
            'lastMessageTimestamp' => date('Y-m-d H:i:s'), 
            'seenBy' => [], 
            'user1_name' => $user1Data['name'] ?? 'Unknown',
            'user1_avatar' => $avatar1,
            'user2_name' => $user2Data['name'] ?? 'Unknown',
            'user2_avatar' => $avatar2
        ];

        $this->db->collection('matches')->document($matchId)->set($matchData);
    }

    private function fetchUserProfile($userId) {
        try {
            $snapshot = $this->db->collection('users')->document($userId)->snapshot();
            
            if ($snapshot->exists()) {
                return $snapshot->data();
            }
            return [];
        } catch (\Exception $e) {
            return []; 
        }
    }
}