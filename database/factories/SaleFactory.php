<?php

namespace Database\Factories;

use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 50, 500);
        $tax = $subtotal * 0.16;
        $discount = 0;

        return [
            'store_id' => Store::factory(),
            'cash_register_id' => CashRegister::factory(),
            'user_id' => User::factory(),
            'sale_number' => 'VTA' . str_pad(fake()->unique()->randomNumber(8), 8, '0', STR_PAD_LEFT),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'total' => $subtotal + $tax - $discount,
            'payment_method' => fake()->randomElement(['efectivo', 'tarjeta', 'transferencia', 'mixto']),
            'status' => 'completada',
            'cancelled_by' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'anulada',
            'cancelled_by' => User::factory(),
            'cancelled_at' => now(),
            'cancellation_reason' => fake()->sentence(),
        ]);
    }
}
