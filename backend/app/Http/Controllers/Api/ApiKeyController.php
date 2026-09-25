<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    /**
     * Liste des clés API du marchand.
     */
    public function index(): JsonResponse
    {
        $keys = ApiKey::where('merchant_id', 1)->get();

        return response()->json([
            'status' => 'success',
            'data' => $keys
        ]);
    }

    /**
     * Rotation de clé API.
     */
    public function rotate(): JsonResponse
    {
        $newPublicKey = 'kpay_live_pub_' . Str::random(16);
        $newSecret = 'kpay_live_sec_' . Str::random(32);

        $apiKey = ApiKey::create([
            'merchant_id' => 1,
            'environment' => 'LIVE',
            'public_key' => $newPublicKey,
            'secret_hash' => bcrypt($newSecret),
            'label' => 'Rotated Key ' . date('Y-m-d H:i'),
            'is_active' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Nouvelle clé API générée. Conservez la clé secrète en lieu sûr.',
            'data' => [
                'public_key' => $newPublicKey,
                'secret_key' => $newSecret,
            ]
        ], 201);
    }
}
