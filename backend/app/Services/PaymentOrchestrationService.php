<?php

namespace App\Services;

use App\Models\Transaction;
use App\Jobs\DispatchWebhookJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentOrchestrationService
{
    /**
     * Traite une demande de prélèvement avec contrôle d'idempotence strict.
     */
    public function processCharge(array $data, ?string $idempotencyKey = null): Transaction
    {
        // 1. Vérification de l'idempotence pour éviter les doubles débits
        if ($idempotencyKey) {
            $existing = Transaction::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                Log::info("Idempotent hit for key: {$idempotencyKey}");
                return $existing;
            }
        }

        // 2. Création de la transaction dans une transaction DB isolée
        return DB::transaction(function () use ($data, $idempotencyKey) {
            $reference = 'KPAY_' . strtoupper(Str::random(14));
            $fee = $this->calculateFee($data['amount'], $data['operator']);

            $transaction = Transaction::create([
                'merchant_id' => $data['merchant_id'] ?? 1,
                'reference' => $reference,
                'amount' => $data['amount'],
                'fee' => $fee,
                'currency' => $data['currency'] ?? 'XOF',
                'operator' => $data['operator'],
                'status' => 'PENDING',
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'idempotency_key' => $idempotencyKey,
                'metadata' => $data['metadata'] ?? [],
            ]);

            // 3. Appel de la passerelle spécifique (MTN, Moov, Celtiis)
            $this->dispatchToProvider($transaction);

            return $transaction;
        });
    }

    /**
     * Simule ou exécute l'appel API vers l'opérateur Télécom (MTN MoMo, Moov, etc.)
     */
    protected function dispatchToProvider(Transaction $transaction): void
    {
        Log::info("Dispatching transaction [{$transaction->reference}] to operator [{$transaction->operator}]");
        
        // En mode démo ou Sandbox, simule un succès immédiat ou asynchrone
        $transaction->update([
            'external_reference' => 'TELCO_' . rand(1000000, 9999999),
            'status' => 'SUCCESS',
        ]);

        // Déclencher le webhook marchand en tâche de fond (Queue Worker)
        DispatchWebhookJob::dispatch($transaction);
    }

    /**
     * Calcule les frais de transaction selon l'opérateur (Modèle économique FinTech)
     */
    protected function calculateFee(float $amount, string $operator): float
    {
        $rates = [
            'MTN_MOMO' => 0.015,    // 1.5%
            'MOOV_MONEY' => 0.014,  // 1.4%
            'CELTIIS_CASH' => 0.012,// 1.2%
            'VISA_CARD' => 0.025,   // 2.5%
        ];

        $rate = $rates[$operator] ?? 0.02;
        return round($amount * $rate, 2);
    }

    /**
     * Rembourse une transaction avec audit et vérification d'éligibilité.
     */
    public function refundTransaction(string $reference, ?string $reason = null): Transaction
    {
        return DB::transaction(function () use ($reference, $reason) {
            $transaction = Transaction::where('reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            if ($transaction->status !== 'SUCCESS') {
                throw new \InvalidArgumentException("Seule une transaction au statut SUCCESS peut être remboursée.");
            }

            $transaction->status = 'REFUNDED';
            $transaction->failure_reason = $reason ?? 'Remboursement marchand accordé';
            $transaction->save();

            Log::info("Transaction {$reference} has been successfully refunded. Reason: {$transaction->failure_reason}");

            return $transaction;
        });
    }
}
