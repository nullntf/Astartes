<?php

use App\Models\CashRegister;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->store = Store::factory()->create();
    $this->cashRegister = CashRegister::factory()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
        'status' => 'abierta',
    ]);
    $this->category = Category::factory()->create();
    $this->product = Product::factory()->create(['category_id' => $this->category->id]);

    $this->product->stores()->attach($this->store->id, [
        'stock' => 100,
        'min_stock' => 10,
    ]);
});

test('guest cannot access sales', function () {
    $this->get(route('sales.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view sales index', function () {
    Sale::factory()->count(3)->create([
        'store_id' => $this->store->id,
        'cash_register_id' => $this->cashRegister->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('sales.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/index')
            ->has('sales.data', 3)
        );
});

test('authenticated user can create a sale', function () {
    $saleData = [
        'store_id' => $this->store->id,
        'cash_register_id' => $this->cashRegister->id,
        'payment_method' => 'efectivo',
        'items' => [
            [
                'product_id' => $this->product->id,
                'quantity' => 2,
                'unit_price' => 100.00,
            ],
        ],
        'tax' => 32.00,
        'discount' => 0,
    ];

    $this->actingAs($this->user)
        ->post(route('sales.store'), $saleData)
        ->assertRedirect(route('sales.index'));

    $this->assertDatabaseHas('sales', [
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
        'subtotal' => 200.00,
        'total' => 232.00,
    ]);

    $this->assertDatabaseHas('sale_items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ]);
});

test('sale creation requires valid data', function () {
    $this->actingAs($this->user)
        ->post(route('sales.store'), [])
        ->assertSessionHasErrors(['store_id', 'cash_register_id', 'payment_method', 'items']);
});

test('authenticated user can cancel a sale', function () {
    $sale = Sale::factory()->create([
        'store_id' => $this->store->id,
        'cash_register_id' => $this->cashRegister->id,
        'user_id' => $this->user->id,
        'status' => 'completada',
    ]);

    $this->actingAs($this->user)
        ->post(route('sales.cancel', $sale), [
            'cancellation_reason' => 'Error en la venta',
        ])
        ->assertRedirect(route('sales.show', $sale));

    $this->assertDatabaseHas('sales', [
        'id' => $sale->id,
        'status' => 'anulada',
        'cancelled_by' => $this->user->id,
    ]);
});

test('cannot cancel already cancelled sale', function () {
    $sale = Sale::factory()->cancelled()->create([
        'store_id' => $this->store->id,
        'cash_register_id' => $this->cashRegister->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('sales.cancel', $sale), [
            'cancellation_reason' => 'Otro motivo',
        ])
        ->assertSessionHasErrors(['error']);
});
