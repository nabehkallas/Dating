<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Firestore\FirestoreClient;

class FeedController extends Controller
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

    public function index(Request $request)
    {
        $userId = $request->firebase_uid;
        if (!$userId) $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $userRef = $this->db->collection('users')->document($userId);
            $userSnapshot = $userRef->snapshot();

            if (!$userSnapshot->exists()) {
                return response()->json(['error' => 'Current user not found'], 404);
            }

            $currentUser = $userSnapshot->data();

            $prefs = $currentUser['preferences'] ?? [];
            $myLocation = $this->normalizeLocation($currentUser['location'] ?? []);
            
            $prefGender   = $prefs['genderInterest'] ?? 'everyone'; 
            $prefMinAge   = $prefs['minAge'] ?? 18;
            $prefMaxAge   = $prefs['maxAge'] ?? 100;
            $prefDistance = $prefs['maxDistance'] ?? 100;

            $swipedUserIds = [];
            $swipesRef = $userRef->collection('swipes')->documents();
            foreach ($swipesRef as $swipeDoc) {
                $swipedUserIds[] = $swipeDoc->id();
            }

            $feed = [];
            $TARGET_SIZE = 20;

            $query = $this->db->collection('users')->limit(200);

            if ($prefGender && $prefGender !== 'everyone') {
                $query = $query->where('gender', '=', $prefGender);
            }

            $documents = $query->documents();

            foreach ($documents as $doc) {
                $candidateId = $doc->id();
                
                if ($candidateId === $userId) continue;

                if (in_array($candidateId, $swipedUserIds)) continue;

                $candidateData = $doc->data();

                $age = $candidateData['age'] ?? 25;
                if ($age < $prefMinAge || $age > $prefMaxAge) continue;

                $distance = 0;
                $candLocation = $this->normalizeLocation($candidateData['location'] ?? []);

                if ($myLocation && $candLocation) {
                    $distance = $this->calculateDistance(
                        $myLocation['lat'], $myLocation['lon'],
                        $candLocation['lat'], $candLocation['lon']
                    );

                    if ($distance > $prefDistance) continue;
                }

                $image =  $candidateData['avatar'] ?? null;

                if (!$image || $image === "") {
                    $image = 'https://placehold.co/600x800/png?text=No+Image'; 
                }

                $candidateData['avatar'] = $image;

                $candidateData['id'] = $candidateId;
                $candidateData['distance_km'] = round($distance, 1);
                
                $feed[] = $candidateData;

                if (count($feed) >= $TARGET_SIZE) break;
            }

            shuffle($feed);

            return response()->json([
                'status' => 'success',
                'count' => count($feed),
                'data' => $feed
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function normalizeLocation($loc) {
        if (empty($loc)) return null;
        if (isset($loc['lat']) && isset($loc['lon'])) return ['lat' => (float)$loc['lat'], 'lon' => (float)$loc['lon']];
        if (isset($loc['latitude']) && isset($loc['longitude'])) return ['lat' => $loc['latitude'], 'lon' => $loc['longitude']];
        if (isset($loc[0]) && isset($loc[1])) return ['lat' => $loc[0], 'lon' => $loc[1]];
        return null;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371; 
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}