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
        $user = $this->user();
        $isAdmin = $user && $user->isAdmin();

        return [
            'store_id' => ['required', 'exists:stores,id'],
            'opening_balance' => [
                $isAdmin ? 'nullable' : 'required',
                'numeric',
                'min:0',
            ],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Para admin: si opening_balance está vacío, null o no existe, usar 0
        if ($this->user()?->isAdmin()) {
            $balance = $this->input('opening_balance');
            if ($balance === null || $balance === '' || !$this->has('opening_balance')) {
                $this->merge(['opening_balance' => 0]);
            }
        }
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
