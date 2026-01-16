<?php

namespace Database\Factories;

use App\Models\CashRegister;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashRegisterFactory extends Factory
{
    protected $model = CashRegister::class;

    public function definition(): array
    {
        return [
            'store_id' => Store::factory(),
            'opened_by' => User::factory(),
            'opened_at' => now(),
            'opening_balance' => fake()->randomFloat(2, 100, 1000),
            'closed_by' => null,
            'closed_at' => null,
            'closing_balance' => null,
            'expected_balance' => null,
            'difference' => null,
            'status' => 'abierta',
            'notes' => null,
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cerrada',
            'closed_by' => User::factory(),
            'closed_at' => now(),
            'closing_balance' => fake()->randomFloat(2, 500, 2000),
            'expected_balance' => fake()->randomFloat(2, 500, 2000),
            'difference' => fake()->randomFloat(2, -50, 50),
        ]);
    }
}
