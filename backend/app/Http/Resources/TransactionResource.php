<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'external_reference' => $this->external_reference,
            'amount' => (float) $this->amount,
            'fee' => (float) $this->fee,
            'net_amount' => (float) ($this->amount - $this->fee),
            'currency' => $this->currency,
            'operator' => $this->operator,
            'status' => $this->status,
            'customer' => [
                'phone' => $this->customer_phone,
                'email' => $this->customer_email,
            ],
            'metadata' => $this->metadata ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
