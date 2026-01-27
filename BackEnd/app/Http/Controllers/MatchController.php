<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Firestore\FirestoreClient;

class MatchController extends Controller
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

    public function getPendingLikes(Request $request)
    {
        $userId = $request->firebase_uid;

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $likesRef = $this->db->collection('users')
                ->document($userId)
                ->collection('received_likes');

            $documents = $likesRef->documents();

            $pendingLikes = [];
            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $data = $doc->data();
                    $data['id'] = $doc->id();
                    $pendingLikes[] = $data;
                }
            }

            return response()->json([
                'status' => 'success',
                'count' => count($pendingLikes),
                'data' => $pendingLikes
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'success', 'data' => []]);
        }
    }

    public function getMatches(Request $request)
    {
        $userId = $request->firebase_uid;

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $matchesRef = $this->db->collection('matches')
                ->where('users', 'array-contains', $userId);
            
            $documents = $matchesRef->documents();
            $myMatches = [];

            foreach ($documents as $doc) {
                if ($doc->exists()) {
                    $data = $doc->data();
                    $data['id'] = $doc->id();

                    if (!isset($data['lastMessageTime'])) {
                        $data['lastMessageTime'] = date('Y-m-d H:i:s'); 
                    }

                    $myMatches[] = $data;
                }
            }

            usort($myMatches, function($a, $b) {
                $timeA = $this->parseTime($a['lastMessageTime']);
                $timeB = $this->parseTime($b['lastMessageTime']);
                return $timeB - $timeA; 
            });

            return response()->json([
                'status' => 'success',
                'count' => count($myMatches),
                'data' => $myMatches
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function parseTime($time)
    {
        if (is_string($time)) {
            return strtotime($time);
        }
        if (is_object($time) && method_exists($time, 'get')) {
            return $time->get()->getTimestamp();
        }
        return 0;
    }
}