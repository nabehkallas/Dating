<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Core\Timestamp;

class DatabaseSeeder extends Seeder
{
    protected $db;

    public function run()
    {
        set_time_limit(300);

        $this->command->info('🔥 Connecting to Firestore...');

        $keyPath = storage_path('firebase_credentials.json');
        if (!file_exists($keyPath)) $keyPath = storage_path('app/firebase_credentials.json');
        
        putenv("GRPC_DEFAULT_SSL_ROOTS_FILE_PATH=C:/Users/nabeh/.config/herd/bin/cacert.pem");

        $this->db = new FirestoreClient([
            'keyFilePath' => $keyPath,
            'projectId' => 'dating-2a0c5',
        ]);

        // ---------------------------------------------------------
        // 1. CLEANUP (Delete everything first)
        // ---------------------------------------------------------
        $this->command->warn("💀 Wiping Old Data...");
        
        // Define IDs strictly to prevent duplicates
        $id1 = 'user_1';
        $id2 = 'user_2'; 
        $id3 = 'user_3';
        $id4 = 'user_4';

        // Deep clean these specific IDs
        $this->deepCleanUser($id1);
        $this->deepCleanUser($id2);
        $this->deepCleanUser($id3);
        $this->deepCleanUser($id4);

        $this->wipeCollection('matches');
        $this->wipeCollection('stories');

        // ---------------------------------------------------------
        // 2. SEED USERS
        // ---------------------------------------------------------
        $this->command->info('🌱 Creating Users...');

        $user1 = [
            'id' => $id1,
            'name' => 'Test User',
            'age' => 25,
            'gender' => 'male',
            'bio' => 'Main tester account.',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            'isVerified' => true
        ];

        $user2 = [
            'id' => $id2,
            'name' => 'Sarah Jones',
            'age' => 24,
            'gender' => 'female',
            'bio' => 'Lover of coffee.',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            'isVerified' => true
        ];

        $user3 = [
            'id' => $id3,
            'name' => 'Mike Ross',
            'age' => 28,
            'gender' => 'male',
            'bio' => 'Lawyer by day.',
            'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            'isVerified' => false
        ];

        $user4 = [
            'id' => $id4,
            'name' => 'Emily Blunt',
            'age' => 22,
            'gender' => 'female',
            'bio' => 'New here!',
            'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            'isVerified' => true
        ];

        // Save Users (Strictly using document($id)->set())
        $this->db->collection('users')->document($id1)->set($user1);
        $this->db->collection('users')->document($id2)->set($user2);
        $this->db->collection('users')->document($id3)->set($user3);
        $this->db->collection('users')->document($id4)->set($user4);

        // ---------------------------------------------------------
        // 3. SEED INTERACTIONS (Swipes & Likes)
        // ---------------------------------------------------------
        $this->command->info('👍 Seeding Swipes & Likes...');

        // SCENARIO: User 1 and User 2 Matched
        // That means User 1 swiped RIGHT on User 2, AND User 2 swiped RIGHT on User 1.

        // 1. User 1 swipes Right on Sarah
        $this->addSwipe($id1, $id2, 'right'); 
        $this->addReceivedLike($id2, $id1, $user1); // Sarah receives like from Test User

        // 2. Sarah swipes Right on User 1
        $this->addSwipe($id2, $id1, 'right'); 
        $this->addReceivedLike($id1, $id2, $user2); // Test User receives like from Sarah

        // 3. Emily (User 4) Likes User 1 (But User 1 hasn't swiped back yet -> No match)
        $this->addSwipe($id4, $id1, 'right');
        $this->addReceivedLike($id1, $id4, $user4);

        // ---------------------------------------------------------
        // 4. SEED MATCHES (Conversations)
        // ---------------------------------------------------------
        $this->command->info('❤️ Seeding Matches...');
        
        // Match 1: User 1 & Sarah
        $this->createMatch($id1, $id2, "Hey Sarah! It's a match!", $user1, $user2);

        // Match 2: User 1 & Mike (Just manual match for testing)
        $this->createMatch($id1, $id3, "Whats up Mike?", $user1, $user3);

        // ---------------------------------------------------------
        // 5. SEED STORIES
        // ---------------------------------------------------------
        $this->command->info('📸 Seeding Stories...');
        $this->createStory($id2, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', '-2 hours');

        $this->command->info('✅ DONE! Database verified and seeded.');
    }

    // --- HELPER FUNCTIONS ---

    private function addSwipe($actorId, $targetId, $type) {
        // Force Strict Path: users/{actorId}/swipes/{targetId}
        $this->db->collection('users')
            ->document($actorId)
            ->collection('swipes')
            ->document($targetId) // Using Document ID prevents duplicates
            ->set([
                'swiped_profile_id' => $targetId,
                'type' => $type,
                'timestamp' => new Timestamp(new \DateTime())
            ]);
    }

    private function addReceivedLike($receiverId, $senderId, $senderData) {
        // Force Strict Path: users/{receiverId}/received_likes/{senderId}
        $this->db->collection('users')
            ->document($receiverId)
            ->collection('received_likes')
            ->document($senderId)
            ->set([
                'from_user_id' => $senderId,
                'from_user_name' => $senderData['name'],
                'from_user_avatar' => $senderData['avatar'],
                'timestamp' => new Timestamp(new \DateTime())
            ]);
    }

    private function createMatch($uid1, $uid2, $lastMsg, $u1Data, $u2Data) {
        $ids = [$uid1, $uid2];
        sort($ids);
        $matchId = $ids[0] . '_' . $ids[1];

        // 1. Create Match Doc
        $this->db->collection('matches')->document($matchId)->set([
            'users' => [$uid1, $uid2],
            'lastMessage' => $lastMsg,
            'lastMessageTimestamp' => date('Y-m-d H:i:s'),
            'user1_name' => $u1Data['name'],
            'user1_avatar' => $u1Data['avatar'],
            'user2_name' => $u2Data['name'],
            'user2_avatar' => $u2Data['avatar'],
        ]);

        // 2. Add Message to Subcollection
        $this->db->collection('matches')->document($matchId)->collection('messages')->add([
            'text' => $lastMsg,
            'senderId' => $uid1,
            'timestamp' => new Timestamp(new \DateTime()),
            'seen' => false
        ]);
    }

    private function createStory($userId, $imgUrl, $timeAgo) {
        $created = new \DateTime($timeAgo);
        $expires = clone $created;
        $expires->modify('+24 hours');

        $this->db->collection('stories')->add([
            'userId' => $userId,
            'imageUrl' => $imgUrl,
            'createdAt' => new Timestamp($created),
            'expiresAt' => new Timestamp($expires),
            'viewers' => []
        ]);
    }

    private function deepCleanUser($uid) {
        $ref = $this->db->collection('users')->document($uid);
        
        // Wipe subcollections first
        $this->wipeRefCollection($ref->collection('swipes'));
        $this->wipeRefCollection($ref->collection('received_likes'));

        // Delete user
        if ($ref->snapshot()->exists()) $ref->delete();
    }

    private function wipeRefCollection($colRef) {
        $docs = $colRef->limit(50)->documents();
        foreach ($docs as $doc) {
            if ($doc->exists()) $doc->reference()->delete();
        }
    }

    private function wipeCollection($colName) {
        $docs = $this->db->collection($colName)->limit(50)->documents();
        foreach ($docs as $doc) {
            if ($doc->exists()) $doc->reference()->delete();
        }
    }
}