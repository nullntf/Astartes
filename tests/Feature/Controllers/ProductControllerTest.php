<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->category = Category::factory()->create();
});

test('guest cannot access products', function () {
    $this->get(route('products.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view products index', function () {
    Product::factory()->count(3)->create(['category_id' => $this->category->id]);

    $this->actingAs($this->user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->has('products.data', 3)
        );
});

test('authenticated user can create a product', function () {
    $productData = [
        'category_id' => $this->category->id,
        'sku' => 'SKU001',
        'name' => 'Producto Nuevo',
        'description' => 'Descripción del producto',
        'cost_price' => 100.00,
        'sale_price' => 150.00,
        'is_active' => true,
    ];

    $this->actingAs($this->user)
        ->post(route('products.store'), $productData)
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'sku' => 'SKU001',
        'name' => 'Producto Nuevo',
        'created_by' => $this->user->id,
    ]);
});

test('product creation requires valid data', function () {
    $this->actingAs($this->user)
        ->post(route('products.store'), [])
        ->assertSessionHasErrors(['category_id', 'sku', 'name', 'cost_price', 'sale_price']);
});

test('product sku must be unique', function () {
    Product::factory()->create(['sku' => 'EXIST01']);

    $this->actingAs($this->user)
        ->post(route('products.store'), [
            'category_id' => $this->category->id,
            'sku' => 'EXIST01',
            'name' => 'Otro Producto',
            'cost_price' => 100,
            'sale_price' => 150,
        ])
        ->assertSessionHasErrors(['sku']);
});

test('authenticated user can update a product', function () {
    $product = Product::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->user)
        ->put(route('products.update', $product), [
            'category_id' => $this->category->id,
            'sku' => $product->sku,
            'name' => 'Producto Actualizado',
            'cost_price' => 200,
            'sale_price' => 300,
        ])
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Producto Actualizado',
        'updated_by' => $this->user->id,
    ]);
});

test('authenticated user can assign product to store', function () {
    $product = Product::factory()->create(['category_id' => $this->category->id]);
    $store = Store::factory()->create();

    $this->actingAs($this->user)
        ->post(route('products.assign-store', $product), [
            'store_id' => $store->id,
            'stock' => 50,
            'min_stock' => 10,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('store_product', [
        'product_id' => $product->id,
        'store_id' => $store->id,
        'stock' => 50,
        'min_stock' => 10,
    ]);
});
