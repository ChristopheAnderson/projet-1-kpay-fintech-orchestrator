<?php

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $backoff = [10, 60, 300, 1800, 3600]; // Exponential backoff

    public function __construct(public Transaction $transaction)
    {
    }

    public function handle(): void
    {
        Log::info("Executing Webhook Dispatch for transaction {$this->transaction->reference}, attempt {$this->attempts()}");

        $payload = [
            'event' => 'payment.success',
            'data' => [
                'reference' => $this->transaction->reference,
                'external_reference' => $this->transaction->external_reference,
                'amount' => $this->transaction->amount,
                'currency' => $this->transaction->currency,
                'operator' => $this->transaction->operator,
                'status' => $this->transaction->status,
                'timestamp' => now()->toIso8601String(),
            ]
        ];

        // URL de webhook du marchand (configurée en base)
        $webhookUrl = 'https://webhook.site/demo-merchant-endpoint';

        try {
            $response = Http::timeout(5)->post($webhookUrl, $payload);
            if (!$response->successful()) {
                throw new \Exception("Merchant server responded with HTTP {$response->status()}");
            }
            Log::info("Webhook delivered successfully to {$webhookUrl}");
        } catch (\Throwable $e) {
            Log::error("Webhook delivery failed: {$e->getMessage()}");
            $this->release($this->backoff[$this->attempts() - 1] ?? 3600);
        }
    }
}
