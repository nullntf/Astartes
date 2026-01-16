<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($productId)],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La categoría es requerida.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'sku.required' => 'El SKU es requerido.',
            'sku.unique' => 'El SKU ya está en uso por otro producto.',
            'sku.max' => 'El SKU no puede exceder 50 caracteres.',
            'name.required' => 'El nombre del producto es requerido.',
            'name.max' => 'El nombre no puede exceder 200 caracteres.',
            'cost_price.required' => 'El precio de costo es requerido.',
            'cost_price.min' => 'El precio de costo no puede ser negativo.',
            'sale_price.required' => 'El precio de venta es requerido.',
            'sale_price.min' => 'El precio de venta no puede ser negativo.',
        ];
    }
}
