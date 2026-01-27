<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Core\Timestamp;

class StoryController extends Controller
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
        $request->validate([
            'user_id' => 'required',
            'imageUrl' => 'required',
            'userName' => 'required',
            'userAvatar' => 'required'
        ]);

        $userId = $request->input('user_id');
        $imageUrl = $request->input('imageUrl');
        $userName = $request->input('userName');
        $userAvatar = $request->input('userAvatar');

        try {
            $storyData = [
                'userId' => $userId,
                'imageUrl' => $imageUrl,
                'userName' => $userName,
                'userAvatar' => $userAvatar,
                'createdAt' => date('Y-m-d H:i:s'),
                'expiresAt' => date('Y-m-d H:i:s', strtotime('+24 hours')),
                'viewers' => []
            ];

            $this->db->collection('stories')->add($storyData);

            return response()->json(['status' => 'success', 'message' => 'Story created']);

        } catch (\Exception $e) {
            Log::error("STORY UPLOAD ERROR: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getStoriesFeed(Request $request)
    {
        $currentUserId = $request->firebase_uid;
        if (!$currentUserId) $currentUserId = $request->query('user_id');

        if (!$currentUserId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $matchesRef = $this->db->collection('matches')
                ->where('users', 'array-contains', $currentUserId);

            $matchedUserIds = [];
            
            foreach ($matchesRef->documents() as $doc) {
                if ($doc->exists()) {
                    $data = $doc->data();
                    if (isset($data['users']) && is_array($data['users'])) {
                        foreach ($data['users'] as $uid) {
                            if ($uid !== $currentUserId) {
                                $matchedUserIds[] = $uid;
                            }
                        }
                    }
                }
            }

            $matchedUserIds[] = $currentUserId;
            $matchedUserIds = array_unique($matchedUserIds);

            if (empty($matchedUserIds)) {
                return response()->json(['status' => 'success', 'data' => []]);
            }

            $chunks = array_chunk($matchedUserIds, 10);
            $validStories = [];
            $now = date('Y-m-d H:i:s');

            foreach ($chunks as $chunk) {
                $query = $this->db->collection('stories')
                    ->where('userId', 'in', $chunk)
                    ->where('expiresAt', '>', $now);

                $documents = $query->documents();

                foreach ($documents as $doc) {
                    if ($doc->exists()) {
                        $data = $doc->data();
                        $data['id'] = $doc->id();
                        $data['imageUrl']= $data['imageUrl'] ?? '';
                        $createdAt = $data['createdAt'] ?? $now;
                        $data['timeAgo'] = $this->calculateTimeAgo($createdAt);

                        $validStories[] = $data;
                    }
                }
            }

            usort($validStories, function ($a, $b) {
                $tA = $this->extractTimestamp($a['createdAt'] ?? 0);
                $tB = $this->extractTimestamp($b['createdAt'] ?? 0);
                return $tB - $tA;
            });

            return response()->json([
                'status' => 'success',
                'count' => count($validStories),
                'data' => $validStories
            ]);

        } catch (\Exception $e) {
            Log::error("STORY FEED ERROR: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    private function extractTimestamp($datetime)
    {
        if (!$datetime) return 0;
        if ($datetime instanceof Timestamp) return $datetime->get()->getTimestamp();
        if ($datetime instanceof \DateTimeInterface) return $datetime->getTimestamp();
        if (is_string($datetime)) return strtotime($datetime);
        if (is_numeric($datetime)) return (int)$datetime;
        return 0;
    }

    private function calculateTimeAgo($datetime)
    {
        $timestamp = $this->extractTimestamp($datetime);
        if (!$timestamp) return 'just now';

        $diff = time() - $timestamp;

        if ($diff < 60) return 'just now';
        
        $mins = floor($diff / 60);
        if ($mins < 60) return $mins . 'm ago';
        
        $hours = floor($mins / 60);
        if ($hours < 24) return $hours . 'h ago';
        
        $days = floor($hours / 24);
        return $days . 'd ago';
    }
}