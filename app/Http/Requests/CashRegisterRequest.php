<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['required', 'exists:stores,id'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'store_id.required' => 'La tienda es requerida.',
            'store_id.exists' => 'La tienda seleccionada no existe.',
            'opening_balance.required' => 'El saldo inicial es requerido.',
            'opening_balance.min' => 'El saldo inicial no puede ser negativo.',
        ];
    }
}
