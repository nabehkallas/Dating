<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Firestore\FieldValue; 

class FirestoreTestController extends Controller
{
    /**
     * -------------------------------------------------------------------------
     * HELPER: Connect to Firestore
     * -------------------------------------------------------------------------
     */
    private function getFirestoreClient()
    {
        if (!extension_loaded('grpc')) {
            throw new \Exception('gRPC extension NOT loaded. Check php.ini.');
        }

        $pathsToCheck = [
            storage_path('firebase_credentials.json'),
            base_path('storage/firebase_credentials.json'),
            storage_path('app/firebase_credentials.json')
        ];

        $keyPath = null;
        foreach ($pathsToCheck as $path) {
            if (file_exists($path)) {
                $keyPath = $path;
                break;
            }
        }

        if (!$keyPath) {
            throw new \Exception('Credentials file not found.');
        }

        return new FirestoreClient([
            'keyFilePath' => $keyPath,
            'projectId' => 'dating-2a0c5',
        ]);
    }

    /**
     * -------------------------------------------------------------------------
     * TOOL 1: DATABASE MIGRATION (Fixes "from_user_" fields)
     * -------------------------------------------------------------------------
     */
    public function normalizeLikesData()
    {
        set_time_limit(300); 

        try {
            $firestore = $this->getFirestoreClient();
            
            // Query ALL 'received_likes' collections
            $likesRef = $firestore->collectionGroup('received_likes');
            $documents = $likesRef->documents();

            $batch = $firestore->batch();
            $batchCount = 0;
            $fixedCount = 0;

            foreach ($documents as $doc) {
                $data = $doc->data();
                $needsUpdate = false;
                $updateData = [];
                $fieldsToDelete = [];

                // 1. Fix Avatar
                if (isset($data['from_user_avatar']) && !isset($data['avatar'])) {
                    $updateData['avatar'] = $data['from_user_avatar'];
                    $fieldsToDelete[] = 'from_user_avatar';
                    $needsUpdate = true;
                }

                // 2. Fix Name
                if (isset($data['from_user_name']) && !isset($data['name'])) {
                    $updateData['name'] = $data['from_user_name'];
                    $fieldsToDelete[] = 'from_user_name';
                    $needsUpdate = true;
                }

                // 3. Fix UID
                if (isset($data['from_user_id']) && !isset($data['uid'])) {
                    $updateData['uid'] = $data['from_user_id'];
                    $fieldsToDelete[] = 'from_user_id';
                    $needsUpdate = true;
                }

                // 4. Ensure Age Exists
                if (!isset($data['age'])) {
                    $updateData['age'] = 25; 
                    $needsUpdate = true;
                }

                if ($needsUpdate) {
                    $docRef = $doc->reference();

                    // Update new fields
                    foreach ($updateData as $key => $val) {
                        $batch->update($docRef, [['path' => $key, 'value' => $val]]);
                    }

                    // Delete old fields using deleteField()
                    foreach ($fieldsToDelete as $field) {
                        $batch->update($docRef, [['path' => $field, 'value' => FieldValue::deleteField()]]);
                    }

                    $batchCount++;
                    $fixedCount++;

                    if ($batchCount >= 400) {
                        $batch->commit();
                        $batch = $firestore->batch();
                        $batchCount = 0;
                    }
                }
            }

            if ($batchCount > 0) {
                $batch->commit();
            }

            return response()->json([
                'status' => 'SUCCESS',
                'message' => 'Database normalization complete.',
                'documents_fixed' => $fixedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'EXCEPTION',
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * -------------------------------------------------------------------------
     * TOOL 2: CLEANUP (Deletes Ghost Data)
     * -------------------------------------------------------------------------
     */
    public function purgeGhostData()
    {
        set_time_limit(300);

        try {
            $firestore = $this->getFirestoreClient();
            $batch = $firestore->batch();
            $batchCount = 0;
            $deletedCounts = ['swipes' => 0, 'received_likes' => 0];
            $userExistenceCache = [];

            $checkUserExists = function($userId) use ($firestore, &$userExistenceCache) {
                if (isset($userExistenceCache[$userId])) return $userExistenceCache[$userId];
                $exists = $firestore->collection('users')->document($userId)->snapshot()->exists();
                $userExistenceCache[$userId] = $exists;
                return $exists;
            };

            $commitBatchIfFull = function() use (&$batch, &$batchCount, $firestore) {
                if ($batchCount >= 400) {
                    $batch->commit();
                    $batch = $firestore->batch();
                    $batchCount = 0;
                }
            };

            // Clean Swipes
            $swipes = $firestore->collectionGroup('swipes')->documents();
            foreach ($swipes as $doc) {
                $parentUserRef = $doc->reference()->parent()->parent();
                if ($parentUserRef && !$checkUserExists($parentUserRef->id())) {
                    $batch->delete($doc->reference());
                    $deletedCounts['swipes']++;
                    $batchCount++;
                    $commitBatchIfFull();
                }
            }

            // Clean Likes
            $likes = $firestore->collectionGroup('received_likes')->documents();
            foreach ($likes as $doc) {
                $parentUserRef = $doc->reference()->parent()->parent();
                if ($parentUserRef && !$checkUserExists($parentUserRef->id())) {
                    $batch->delete($doc->reference());
                    $deletedCounts['received_likes']++;
                    $batchCount++;
                    $commitBatchIfFull();
                }
            }

            if ($batchCount > 0) $batch->commit();

            return response()->json(['status' => 'SUCCESS', 'deleted' => $deletedCounts]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * -------------------------------------------------------------------------
     * TOOL 3: DIAGNOSTIC (Reads Ghost Data)
     * -------------------------------------------------------------------------
     */
    public function analyzeGhostData()
    {
        set_time_limit(300);
        try {
            $firestore = $this->getFirestoreClient();
            $report = ['orphaned_swipes' => [], 'orphaned_received_likes' => []];
            $userExistenceCache = [];

            $checkUserExists = function($userId) use ($firestore, &$userExistenceCache) {
                if (isset($userExistenceCache[$userId])) return $userExistenceCache[$userId];
                $exists = $firestore->collection('users')->document($userId)->snapshot()->exists();
                $userExistenceCache[$userId] = $exists;
                return $exists;
            };

            // Scan Swipes
            $swipes = $firestore->collectionGroup('swipes')->documents();
            foreach ($swipes as $doc) {
                $parentUserRef = $doc->reference()->parent()->parent();
                if ($parentUserRef && !$checkUserExists($parentUserRef->id())) {
                    $report['orphaned_swipes'][] = ['id' => $doc->id(), 'ghost_user' => $parentUserRef->id()];
                }
            }

            // Scan Likes
            $likes = $firestore->collectionGroup('received_likes')->documents();
            foreach ($likes as $doc) {
                $parentUserRef = $doc->reference()->parent()->parent();
                if ($parentUserRef && !$checkUserExists($parentUserRef->id())) {
                    $report['orphaned_received_likes'][] = ['id' => $doc->id(), 'ghost_user' => $parentUserRef->id()];
                }
            }

            return response()->json(['status' => 'SUCCESS', 'report' => $report]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * -------------------------------------------------------------------------
     * TOOL 4: CONNECTION TEST
     * -------------------------------------------------------------------------
     */
    public function testConnection()
    {
        try {
            $firestore = $this->getFirestoreClient();
            $firestore->collection('grpc_test')->document('test')->set(['message' => 'OK']);
            return response()->json(['status' => 'SUCCESS', 'message' => 'Connected!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
        }
    }
}