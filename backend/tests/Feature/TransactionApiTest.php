<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Merchant;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Création du marchand de test
        Merchant::firstOrCreate(
            ['contact_email' => 'finances@global-commerce.com'],
            [
                'business_name' => 'Global Commerce SARL',
                'phone_number' => '+229 97 00 11 22',
                'country_code' => 'BJ',
                'is_active' => true,
            ]
        );
    }

    /**
     * Teste l'initiation d'un prélèvement Mobile Money réussi.
     */
    public function test_can_initiate_mobile_money_charge(): void
    {
        $payload = [
            'amount' => 15000,
            'operator' => 'MTN_MOMO',
            'customer_phone' => '+229 97 12 34 56',
            'customer_email' => 'test@client.bj',
            'currency' => 'XOF',
        ];

        $response = $this->postJson('/api/v1/transactions/charge', $payload, [
            'Idempotency-Key' => 'idemp_test_' . uniqid(),
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'reference',
                         'amount',
                         'fee',
                         'currency',
                         'operator',
                         'status',
                     ]
                 ]);

        $this->assertEquals(225, $response->json('data.fee')); // 1.5% de 15000
    }

    /**
     * Teste que l'envoi de la même clé d'idempotence ne crée pas de double transaction.
     */
    public function test_charge_is_strictly_idempotent(): void
    {
        $idempotencyKey = 'idemp_unique_' . uniqid();
        $payload = [
            'amount' => 5000,
            'operator' => 'MOOV_MONEY',
            'customer_phone' => '+229 95 00 00 00',
        ];

        // 1er appel
        $res1 = $this->postJson('/api/v1/transactions/charge', $payload, [
            'Idempotency-Key' => $idempotencyKey,
        ]);
        $res1->assertStatus(201);
        $reference1 = $res1->json('data.reference');

        // 2ème appel identique avec la même clé
        $res2 = $this->postJson('/api/v1/transactions/charge', $payload, [
            'Idempotency-Key' => $idempotencyKey,
        ]);
        $res2->assertStatus(201);
        $reference2 = $res2->json('data.reference');

        // Les deux réponses doivent pointer vers la même référence de transaction
        $this->assertEquals($reference1, $reference2);
    }

    /**
     * Teste le rejet en cas de montant inférieur au seuil minimum.
     */
    public function test_rejects_amount_below_minimum(): void
    {
        $payload = [
            'amount' => 50, // Moins que le minimum de 100 XOF
            'operator' => 'CELTIIS_CASH',
            'customer_phone' => '+229 40 00 00 00',
        ];

        $response = $this->postJson('/api/v1/transactions/charge', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['amount']);
    }
}
