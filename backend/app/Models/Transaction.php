<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'reference',
        'external_reference',
        'amount',
        'fee',
        'currency',
        'operator',          // 'MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'VISA_CARD'
        'status',            // 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
        'customer_phone',
        'customer_email',
        'idempotency_key',
        'metadata',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function webhookLogs()
    {
        return $this->hasMany(WebhookLog::class);
    }
}
