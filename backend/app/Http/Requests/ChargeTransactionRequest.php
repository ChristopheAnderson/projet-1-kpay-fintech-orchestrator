<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChargeTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:100', 'max:5000000'],
            'operator' => ['required', 'in:MTN_MOMO,MOOV_MONEY,CELTIIS_CASH,VISA_CARD'],
            'customer_phone' => ['required', 'string', 'regex:/^\+?[0-9\s\-]{8,20}$/'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'currency' => ['nullable', 'string', 'in:XOF,EUR,USD'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Le montant de la transaction est obligatoire.',
            'amount.min' => 'Le montant minimum par transaction est de 100 XOF.',
            'operator.required' => 'L\'opérateur de paiement doit être spécifié.',
            'operator.in' => 'Opérateur non supporté (Choix : MTN_MOMO, MOOV_MONEY, CELTIIS_CASH, VISA_CARD).',
            'customer_phone.required' => 'Le numéro de téléphone du client est requis pour le prélèvement.',
            'customer_phone.regex' => 'Format de téléphone invalide.',
        ];
    }
}
