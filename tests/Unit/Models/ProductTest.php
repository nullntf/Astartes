<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;

test('product can be created with valid data', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'sku' => 'PROD001',
        'name' => 'Laptop HP',
        'cost_price' => 500.00,
        'sale_price' => 750.00,
    ]);

    expect($product)->toBeInstanceOf(Product::class)
        ->and($product->sku)->toBe('PROD001')
        ->and($product->name)->toBe('Laptop HP')
        ->and((float) $product->cost_price)->toEqual(500.00)
        ->and((float) $product->sale_price)->toEqual(750.00);
});

test('product belongs to category', function () {
    $category = Category::factory()->create(['name' => 'Computadoras']);
    $product = Product::factory()->create(['category_id' => $category->id]);

    expect($product->category)->toBeInstanceOf(Category::class)
        ->and($product->category->name)->toBe('Computadoras');
});

test('product can be assigned to stores with stock', function () {
    $product = Product::factory()->create();
    $store = Store::factory()->create();

    $product->stores()->attach($store->id, [
        'stock' => 50,
        'min_stock' => 10,
    ]);

    expect($product->stores)->toHaveCount(1)
        ->and($product->stores->first()->pivot->stock)->toBe(50)
        ->and($product->stores->first()->pivot->min_stock)->toBe(10);
});

test('product prices are cast to decimal', function () {
    $product = Product::factory()->create([
        'cost_price' => '100.50',
        'sale_price' => '150.75',
    ]);

    expect($product->cost_price)->toBeNumeric()
        ->and($product->sale_price)->toBeNumeric();
});
