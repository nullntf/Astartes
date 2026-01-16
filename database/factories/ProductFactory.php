<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'sku' => fake()->unique()->regexify('[A-Z]{3}[0-9]{5}'),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'cost_price' => fake()->randomFloat(2, 10, 500),
            'sale_price' => fake()->randomFloat(2, 20, 1000),
            'is_active' => true,
            'created_by' => null,
            'updated_by' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
