<?php

use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\Store;
use App\Models\User;

test('cash register can be opened', function () {
    $store = Store::factory()->create();
    $user = User::factory()->create();

    $cashRegister = CashRegister::factory()->create([
        'store_id' => $store->id,
        'opened_by' => $user->id,
        'opening_balance' => 500.00,
        'status' => 'abierta',
    ]);

    expect($cashRegister)->toBeInstanceOf(CashRegister::class)
        ->and((float) $cashRegister->opening_balance)->toEqual(500.00)
        ->and($cashRegister->status)->toBe('abierta');
});

test('cash register belongs to store', function () {
    $store = Store::factory()->create(['name' => 'Tienda Norte']);
    $cashRegister = CashRegister::factory()->create(['store_id' => $store->id]);

    expect($cashRegister->store)->toBeInstanceOf(Store::class)
        ->and($cashRegister->store->name)->toBe('Tienda Norte');
});

test('cash register has sales relationship', function () {
    $cashRegister = CashRegister::factory()->create();
    $sale = Sale::factory()->create(['cash_register_id' => $cashRegister->id]);

    expect($cashRegister->sales)->toHaveCount(1)
        ->and($cashRegister->sales->first()->id)->toBe($sale->id);
});

test('cash register has cash movements relationship', function () {
    $cashRegister = CashRegister::factory()->create();
    $movement = CashMovement::factory()->create(['cash_register_id' => $cashRegister->id]);

    expect($cashRegister->cashMovements)->toHaveCount(1)
        ->and($cashRegister->cashMovements->first()->id)->toBe($movement->id);
});

test('cash register can be closed', function () {
    $user = User::factory()->create();
    $cashRegister = CashRegister::factory()->create([
        'status' => 'abierta',
        'opening_balance' => 500.00,
    ]);

    // Crear una venta en efectivo para que el Observer calcule el expected_balance
    Sale::factory()->create([
        'cash_register_id' => $cashRegister->id,
        'store_id' => $cashRegister->store_id,
        'total' => 200.00,
        'payment_method' => 'efectivo',
        'status' => 'completada',
    ]);

    $cashRegister->update([
        'status' => 'cerrada',
        'closed_by' => $user->id,
        'closed_at' => now(),
        'closing_balance' => 750.00, // closing_balance
    ]);

    // El Observer calcula: expected_balance = opening_balance + ventas = 500 + 200 = 700
    // difference = closing_balance - expected_balance = 750 - 700 = 50
    expect($cashRegister->status)->toBe('cerrada')
        ->and($cashRegister->closedBy)->toBeInstanceOf(User::class)
        ->and((float) $cashRegister->expected_balance)->toEqual(700.00)
        ->and((float) $cashRegister->difference)->toEqual(50.00);
});
