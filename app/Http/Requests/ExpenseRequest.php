<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['required', 'exists:stores,id'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'items' => ['nullable', 'array'],
            'items.*.description' => ['required', 'string', 'max:200'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'store_id.required' => 'La tienda es requerida.',
            'store_id.exists' => 'La tienda seleccionada no existe.',
            'category.required' => 'La categoría del gasto es requerida.',
            'category.max' => 'La categoría no puede exceder 100 caracteres.',
            'description.required' => 'La descripción es requerida.',
            'amount.required' => 'El monto es requerido.',
            'amount.min' => 'El monto no puede ser negativo.',
            'expense_date.required' => 'La fecha del gasto es requerida.',
            'expense_date.date' => 'La fecha no es válida.',
            'items.*.description.required' => 'La descripción del item es requerida.',
            'items.*.description.max' => 'La descripción del item no puede exceder 200 caracteres.',
            'items.*.amount.required' => 'El monto del item es requerido.',
            'items.*.amount.min' => 'El monto del item no puede ser negativo.',
        ];
    }
}
