<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Statistiques globales du tableau de bord marchand.
     */
    public function stats(): JsonResponse
    {
        $totalVolume = Transaction::where('status', 'SUCCESS')->sum('amount');
        $totalTransactions = Transaction::count();
        $successfulTransactions = Transaction::where('status', 'SUCCESS')->count();
        $successRate = $totalTransactions > 0 ? round(($successfulTransactions / $totalTransactions) * 100, 1) : 100;

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_volume_xof' => (float) $totalVolume,
                'success_rate' => (float) $successRate,
                'avg_latency_ms' => 240,
                'webhooks_delivered_pct' => 100,
                'operators_breakdown' => [
                    'MTN_MOMO' => Transaction::where('operator', 'MTN_MOMO')->count(),
                    'MOOV_MONEY' => Transaction::where('operator', 'MOOV_MONEY')->count(),
                    'CELTIIS_CASH' => Transaction::where('operator', 'CELTIIS_CASH')->count(),
                    'VISA_CARD' => Transaction::where('operator', 'VISA_CARD')->count(),
                ]
            ]
        ]);
    }
}
