<?php

namespace Database\Factories;

use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashMovementFactory extends Factory
{
    protected $model = CashMovement::class;

    public function definition(): array
    {
        return [
            'cash_register_id' => CashRegister::factory(),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['deposito', 'retiro']),
            'amount' => fake()->randomFloat(2, 50, 500),
            'reason' => fake()->sentence(),
            'created_by' => null,
        ];
    }

    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'deposito',
        ]);
    }

    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'retiro',
        ]);
    }
}
