<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $storeId = $this->route('store')?->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', Rule::unique('stores', 'code')->ignore($storeId)],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la tienda es requerido.',
            'name.max' => 'El nombre no puede exceder 100 caracteres.',
            'code.required' => 'El código de la tienda es requerido.',
            'code.unique' => 'El código ya está en uso por otra tienda.',
            'code.max' => 'El código no puede exceder 20 caracteres.',
            'phone.max' => 'El teléfono no puede exceder 20 caracteres.',
        ];
    }
}
