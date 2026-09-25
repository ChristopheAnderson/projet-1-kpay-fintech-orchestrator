<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ApiKeyController;

/*
|--------------------------------------------------------------------------
| API Routes — KPay Payment Gateway v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Endpoints publics ou appelés par les Webhooks Opérateurs
    Route::post('/webhooks/momo', [WebhookController::class, 'handleMomoCallback']);
    Route::post('/webhooks/moov', [WebhookController::class, 'handleMoovCallback']);
    Route::post('/webhooks/celtiis', [WebhookController::class, 'handleCeltiisCallback']);

    // Endpoints sécurisés pour Marchands & Frontend
    Route::middleware(['api'])->group(function () {
        
        // Initialisation et exécution de paiement (Supporte Idempotency-Key)
        Route::post('/transactions/charge', [TransactionController::class, 'charge']);
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/{reference}', [TransactionController::class, 'show']);
        Route::post('/transactions/{reference}/refund', [TransactionController::class, 'refund']);

        // Données analytiques pour le Dashboard React
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/volume-chart', [DashboardController::class, 'volumeChart']);

        // Gestion des Webhooks Marchands (Logs & Retry)
        Route::get('/webhooks/logs', [WebhookController::class, 'logs']);
        Route::post('/webhooks/logs/{id}/retry', [WebhookController::class, 'retry']);

        // Gestion des clés API Marchand (Live / Test)
        Route::get('/developer/api-keys', [ApiKeyController::class, 'index']);
        Route::post('/developer/api-keys/rotate', [ApiKeyController::class, 'rotate']);
    });
});
