<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Merchant;
use App\Models\ApiKey;
use App\Models\Transaction;

class KPayDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $merchant = Merchant::firstOrCreate(
            ['contact_email' => 'finances@global-commerce.com'],
            [
                'business_name' => 'Global Commerce SARL',
                'phone_number' => '+229 97 00 11 22',
                'country_code' => 'BJ',
                'webhook_url' => 'https://webhook.site/merchant-callback',
                'webhook_secret' => 'whsec_merchant_live_secret_99818',
                'is_active' => true,
            ]
        );

        ApiKey::firstOrCreate(
            ['public_key' => 'kpay_live_pub_78a1bc92e0f4'],
            [
                'merchant_id' => $merchant->id,
                'environment' => 'LIVE',
                'secret_hash' => bcrypt('kpay_live_sec_demo123'),
                'label' => 'Production Master Key',
                'is_active' => true,
            ]
        );

        $demoTransactions = [
            [
                'reference' => 'KPAY_8F9A2B3C4D11',
                'external_reference' => 'TELCO_9482910',
                'amount' => 45000.00,
                'fee' => 675.00,
                'currency' => 'XOF',
                'operator' => 'MTN_MOMO',
                'status' => 'SUCCESS',
                'customer_phone' => '+229 97 00 12 34',
                'customer_email' => 'client@example.bj',
                'idempotency_key' => 'idemp_8910283401',
            ],
            [
                'reference' => 'KPAY_3E7D1C5B9A22',
                'external_reference' => 'TELCO_8192034',
                'amount' => 12500.00,
                'fee' => 175.00,
                'currency' => 'XOF',
                'operator' => 'MOOV_MONEY',
                'status' => 'SUCCESS',
                'customer_phone' => '+229 95 11 22 33',
                'customer_email' => 'client2@example.bj',
                'idempotency_key' => 'idemp_7718293012',
            ],
            [
                'reference' => 'KPAY_9C2D4E6F8A33',
                'external_reference' => null,
                'amount' => 80000.00,
                'fee' => 960.00,
                'currency' => 'XOF',
                'operator' => 'CELTIIS_CASH',
                'status' => 'PENDING',
                'customer_phone' => '+229 40 88 99 00',
                'customer_email' => null,
                'idempotency_key' => 'idemp_1192837465',
            ],
            [
                'reference' => 'KPAY_1A5C7E9B2D44',
                'external_reference' => 'VISA_AUTH_9921',
                'amount' => 150000.00,
                'fee' => 3750.00,
                'currency' => 'XOF',
                'operator' => 'VISA_CARD',
                'status' => 'SUCCESS',
                'customer_phone' => '+229 96 44 55 66',
                'customer_email' => 'finance@entreprise.bj',
                'idempotency_key' => 'idemp_4455667788',
            ]
        ];

        foreach ($demoTransactions as $tx) {
            Transaction::firstOrCreate(
                ['reference' => $tx['reference']],
                array_merge($tx, ['merchant_id' => $merchant->id])
            );
        }
    }
}
