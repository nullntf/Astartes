<?php

use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Store;
use App\Models\User;

test('sale can be created with valid data', function () {
    $store = Store::factory()->create();
    $user = User::factory()->create();
    $cashRegister = CashRegister::factory()->create(['store_id' => $store->id]);

    $sale = Sale::factory()->create([
        'store_id' => $store->id,
        'user_id' => $user->id,
        'cash_register_id' => $cashRegister->id,
        'sale_number' => 'VTA00000001',
        'subtotal' => 100.00,
        'tax' => 16.00,
        'discount' => 0,
        'total' => 116.00,
        'payment_method' => 'efectivo',
        'status' => 'completada',
    ]);

    expect($sale)->toBeInstanceOf(Sale::class)
        ->and($sale->sale_number)->toBe('VTA00000001')
        ->and((float) $sale->total)->toEqual(116.00)
        ->and($sale->status)->toBe('completada');
});

test('sale belongs to store', function () {
    $store = Store::factory()->create(['name' => 'Tienda Centro']);
    $sale = Sale::factory()->create(['store_id' => $store->id]);

    expect($sale->store)->toBeInstanceOf(Store::class)
        ->and($sale->store->name)->toBe('Tienda Centro');
});

test('sale has items relationship', function () {
    $sale = Sale::factory()->create();
    $item = SaleItem::factory()->create(['sale_id' => $sale->id]);

    expect($sale->items)->toHaveCount(1)
        ->and($sale->items->first()->id)->toBe($item->id);
});

test('sale can be cancelled', function () {
    $user = User::factory()->create();
    $sale = Sale::factory()->create(['status' => 'completada']);

    $sale->update([
        'status' => 'anulada',
        'cancelled_by' => $user->id,
        'cancelled_at' => now(),
        'cancellation_reason' => 'Cliente solicitó anulación',
    ]);

    expect($sale->status)->toBe('anulada')
        ->and($sale->cancelledBy)->toBeInstanceOf(User::class)
        ->and($sale->cancellation_reason)->toBe('Cliente solicitó anulación');
});

test('sale amounts are cast to decimal', function () {
    $sale = Sale::factory()->create([
        'subtotal' => '100.50',
        'tax' => '16.08',
        'total' => '116.58',
    ]);

    expect($sale->subtotal)->toBeNumeric()
        ->and($sale->tax)->toBeNumeric()
        ->and($sale->total)->toBeNumeric();
});
