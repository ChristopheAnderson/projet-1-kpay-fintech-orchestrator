<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\PaymentOrchestrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(protected PaymentOrchestrationService $paymentService)
    {
    }

    /**
     * Liste paginée des transactions marchandes avec filtres multicritères.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('operator')) {
            $query->where('operator', $request->operator);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $transactions = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
                'per_page' => $transactions->perPage(),
            ]
        ]);
    }

    /**
     * Prélèvement ou paiement Mobile Money.
     */
    public function charge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'operator' => 'required|in:MTN_MOMO,MOOV_MONEY,CELTIIS_CASH,VISA_CARD',
            'customer_phone' => 'required|string',
            'customer_email' => 'nullable|email',
            'currency' => 'nullable|string|in:XOF,EUR,USD',
            'metadata' => 'nullable|array',
        ]);

        $idempotencyKey = $request->header('Idempotency-Key');

        $transaction = $this->paymentService->processCharge($validated, $idempotencyKey);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction initiée avec succès',
            'data' => $transaction,
        ], 201);
    }

    /**
     * Détails d'une transaction par sa référence.
     */
     public function show(string $reference): JsonResponse
     {
         $transaction = Transaction::where('reference', $reference)->firstOrFail();

         return response()->json([
             'status' => 'success',
             'data' => $transaction,
         ]);
     }

    /**
     * Remboursement partiel ou total d'une transaction.
     */
    public function refund(Request $request, string $reference): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            $transaction = $this->paymentService->refundTransaction($reference, $validated['reason'] ?? null);
            return response()->json([
                'status' => 'success',
                'message' => 'Transaction remboursée avec succès',
                'data' => $transaction,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
