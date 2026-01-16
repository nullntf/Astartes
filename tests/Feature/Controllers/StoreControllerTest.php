<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Vite;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->withoutVite();
});

test('guest cannot access stores', function () {
    $this->get(route('stores.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view stores index', function () {
    Store::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('stores.index'))
        ->assertOk();
});

test('authenticated user can create a store', function () {
    $storeData = [
        'name' => 'Nueva Tienda',
        'code' => 'NT001',
        'address' => 'Calle 123',
        'phone' => '555-1234',
        'is_active' => true,
    ];

    $this->actingAs($this->user)
        ->post(route('stores.store'), $storeData)
        ->assertRedirect(route('stores.index'));

    $this->assertDatabaseHas('stores', [
        'name' => 'Nueva Tienda',
        'code' => 'NT001',
        'created_by' => $this->user->id,
    ]);
});

test('store creation requires valid data', function () {
    $this->actingAs($this->user)
        ->post(route('stores.store'), [])
        ->assertSessionHasErrors(['name', 'code']);
});

test('store code must be unique', function () {
    Store::factory()->create(['code' => 'EXIST01']);

    $this->actingAs($this->user)
        ->post(route('stores.store'), [
            'name' => 'Otra Tienda',
            'code' => 'EXIST01',
        ])
        ->assertSessionHasErrors(['code']);
});

test('authenticated user can update a store', function () {
    $store = Store::factory()->create();

    $this->actingAs($this->user)
        ->put(route('stores.update', $store), [
            'name' => 'Tienda Actualizada',
            'code' => $store->code,
        ])
        ->assertRedirect(route('stores.index'));

    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'name' => 'Tienda Actualizada',
        'updated_by' => $this->user->id,
    ]);
});

test('authenticated user can delete a store', function () {
    $store = Store::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('stores.destroy', $store))
        ->assertRedirect(route('stores.index'));

    $this->assertDatabaseMissing('stores', ['id' => $store->id]);
});

test('authenticated user can view store details', function () {
    $store = Store::factory()->create();

    $this->actingAs($this->user)
        ->get(route('stores.show', $store))
        ->assertOk();
});
