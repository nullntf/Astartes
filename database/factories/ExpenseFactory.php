<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'store_id' => Store::factory(),
            'user_id' => User::factory(),
            'category' => fake()->randomElement(['servicios', 'mantenimiento', 'suministros', 'transporte']),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 50, 1000),
            'status' => 'activo',
            'cancelled_by' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'expense_date' => fake()->date(),
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'anulado',
            'cancelled_by' => User::factory(),
            'cancelled_at' => now(),
            'cancellation_reason' => fake()->sentence(),
        ]);
    }
}
