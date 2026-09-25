<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Table Marchands
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('business_name', 150);
            $table->string('contact_email', 150)->unique();
            $table->string('phone_number', 30);
            $table->string('country_code', 5)->default('BJ');
            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Table Clés API
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->onDelete('cascade');
            $table->enum('environment', ['TEST', 'LIVE'])->default('TEST');
            $table->string('public_key', 80)->unique();
            $table->string('secret_hash');
            $table->string('label', 100)->default('Default Key');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        // 3. Table Transactions
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->onDelete('restrict');
            $table->string('reference', 50)->unique();
            $table->string('external_reference', 100)->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0.00);
            $table->string('currency', 5)->default('XOF');
            $table->enum('operator', ['MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'VISA_CARD']);
            $table->enum('status', ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'])->default('PENDING');
            $table->string('customer_phone', 30);
            $table->string('customer_email', 150)->nullable();
            $table->string('idempotency_key', 100)->nullable()->unique();
            $table->jsonb('metadata')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['merchant_id', 'created_at']);
            $table->index('operator');
            $table->index('status');
        });

        // 4. Table Webhook Deliveries
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->foreignId('merchant_id')->constrained('merchants')->onDelete('cascade');
            $table->string('event_type', 60);
            $table->jsonb('payload');
            $table->integer('response_code')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('attempts')->default(0);
            $table->enum('status', ['PENDING', 'DELIVERED', 'FAILED'])->default('PENDING');
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'next_retry_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('merchants');
    }
};
