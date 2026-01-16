<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CashMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:deposito,retiro'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'El tipo de movimiento es requerido.',
            'type.in' => 'El tipo debe ser depósito o retiro.',
            'amount.required' => 'El monto es requerido.',
            'amount.min' => 'El monto mínimo es 0.01.',
            'reason.required' => 'La razón del movimiento es requerida.',
            'reason.max' => 'La razón no puede exceder 500 caracteres.',
        ];
    }
}
