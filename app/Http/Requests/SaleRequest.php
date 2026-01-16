<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['required', 'exists:stores,id'],
            'cash_register_id' => ['required', 'exists:cash_registers,id'],
            'payment_method' => ['required', 'in:efectivo,tarjeta,transferencia,mixto'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'store_id.required' => 'La tienda es requerida.',
            'store_id.exists' => 'La tienda seleccionada no existe.',
            'cash_register_id.required' => 'La caja registradora es requerida.',
            'cash_register_id.exists' => 'La caja registradora no existe.',
            'payment_method.required' => 'El método de pago es requerido.',
            'payment_method.in' => 'El método de pago no es válido.',
            'items.required' => 'Debe agregar al menos un producto.',
            'items.min' => 'Debe agregar al menos un producto.',
            'items.*.product_id.required' => 'El producto es requerido.',
            'items.*.product_id.exists' => 'El producto no existe.',
            'items.*.quantity.required' => 'La cantidad es requerida.',
            'items.*.quantity.min' => 'La cantidad mínima es 1.',
            'items.*.unit_price.required' => 'El precio unitario es requerido.',
            'items.*.unit_price.min' => 'El precio no puede ser negativo.',
        ];
    }
}
