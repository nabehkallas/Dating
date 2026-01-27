<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FirebaseVerify
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'No token provided'], 401);
        }

        try {
            $publicKeys = Cache::remember('firebase_public_keys', 60 * 60 * 24, function () {
                $response = Http::get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
                return $response->json();
            });

            $keys = [];
            foreach ($publicKeys as $kid => $cert) {
                $keys[$kid] = new Key($cert, 'RS256');
            }

            JWT::$leeway = 21600; 

            $decoded = JWT::decode($token, $keys);

            if ($decoded->aud !== 'dating-2a0c5') { 
                throw new \Exception('Invalid Audience');
            }
            if ($decoded->iss !== 'https://securetoken.google.com/dating-2a0c5') {
                throw new \Exception('Invalid Issuer');
            }

            $request->attributes->add(['firebase_uid' => $decoded->sub]);
            
            $request->merge(['firebase_uid' => $decoded->sub]);

            return $next($request);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
        }
    }
}