<?php

use App\Models\Store;
use App\Models\User;

test('store can be created with valid data', function () {
    $store = Store::factory()->create([
        'name' => 'Tienda Centro',
        'code' => 'TC001',
        'is_active' => true,
    ]);

    expect($store)->toBeInstanceOf(Store::class)
        ->and($store->name)->toBe('Tienda Centro')
        ->and($store->code)->toBe('TC001')
        ->and($store->is_active)->toBeTrue();
});

test('store has users relationship', function () {
    $store = Store::factory()->create();
    $user = User::factory()->create([
        'store_id' => $store->id,
        'role' => 'vendedor',
    ]);

    expect($store->users)->toHaveCount(1)
        ->and($store->users->first()->id)->toBe($user->id);
});

test('store has created_by relationship', function () {
    $creator = User::factory()->create(['role' => 'admin']);
    $store = Store::factory()->create(['created_by' => $creator->id]);

    expect($store->createdBy)->toBeInstanceOf(User::class)
        ->and($store->createdBy->id)->toBe($creator->id);
});

test('store is_active is cast to boolean', function () {
    $store = Store::factory()->create(['is_active' => 1]);

    expect($store->is_active)->toBeBool()->toBeTrue();
});
