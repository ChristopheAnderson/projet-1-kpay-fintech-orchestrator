<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Jobs\DispatchWebhookJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Callback entrant de l'opérateur MTN Mobile Money.
     */
    public function handleMomoCallback(Request $request): JsonResponse
    {
        Log::info("Incoming MTN MoMo Webhook", $request->all());

        $externalRef = $request->input('financialTransactionId') ?? $request->input('external_reference');
        $status = $request->input('status') === 'SUCCESSFUL' ? 'SUCCESS' : 'FAILED';

        if ($externalRef) {
            $transaction = Transaction::where('external_reference', $externalRef)->first();
            if ($transaction) {
                $transaction->update(['status' => $status]);
                DispatchWebhookJob::dispatch($transaction);
            }
        }

        return response()->json(['status' => 'received'], 200);
    }

    /**
     * Callback entrant de Moov Money.
     */
    public function handleMoovCallback(Request $request): JsonResponse
    {
        Log::info("Incoming Moov Money Webhook", $request->all());

        return response()->json(['status' => 'received'], 200);
    }

    /**
     * Callback entrant de Celtiis Cash.
     */
    public function handleCeltiisCallback(Request $request): JsonResponse
    {
        Log::info("Incoming Celtiis Cash Webhook", $request->all());

        return response()->json(['status' => 'received'], 200);
    }
}
