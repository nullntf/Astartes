<?php

use App\Models\CashRegister;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->store = Store::factory()->create();
    $this->withoutVite();
});

test('guest cannot access cash registers', function () {
    $this->get(route('cash-registers.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view cash registers index', function () {
    CashRegister::factory()->count(3)->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('cash-registers.index'))
        ->assertOk();
});

test('authenticated user can open a cash register', function () {
    $response = $this->actingAs($this->user)
        ->post(route('cash-registers.store'), [
            'store_id' => $this->store->id,
            'opening_balance' => 500.00,
            'notes' => 'Apertura normal',
        ]);

    $cashRegister = CashRegister::latest()->first();
    $response->assertRedirect(route('cash-registers.show', $cashRegister));

    $this->assertDatabaseHas('cash_registers', [
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
        'opening_balance' => 500.00,
        'status' => 'abierta',
    ]);
});

test('cannot open cash register if one is already open for store', function () {
    CashRegister::factory()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
        'status' => 'abierta',
    ]);

    $this->actingAs($this->user)
        ->post(route('cash-registers.store'), [
            'store_id' => $this->store->id,
            'opening_balance' => 500.00,
        ])
        ->assertSessionHasErrors(['error']);
});

test('authenticated user can close a cash register', function () {
    $cashRegister = CashRegister::factory()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
        'status' => 'abierta',
    ]);

    $this->actingAs($this->user)
        ->post(route('cash-registers.close', $cashRegister), [
            'closing_balance' => 1500.00,
            'notes' => 'Cierre normal',
        ])
        ->assertRedirect(route('cash-registers.show', $cashRegister));

    $this->assertDatabaseHas('cash_registers', [
        'id' => $cashRegister->id,
        'status' => 'cerrada',
        'closed_by' => $this->user->id,
        'closing_balance' => 1500.00,
    ]);
});

test('cannot close already closed cash register', function () {
    $cashRegister = CashRegister::factory()->closed()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('cash-registers.close', $cashRegister), [
            'closing_balance' => 1500.00,
        ])
        ->assertSessionHasErrors(['error']);
});

test('authenticated user can add movement to open cash register', function () {
    $cashRegister = CashRegister::factory()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
        'status' => 'abierta',
    ]);

    $this->actingAs($this->user)
        ->post(route('cash-registers.movements', $cashRegister), [
            'type' => 'deposito',
            'amount' => 100.00,
            'reason' => 'Depósito de cambio',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('cash_movements', [
        'cash_register_id' => $cashRegister->id,
        'type' => 'deposito',
        'amount' => 100.00,
    ]);
});

test('cannot add movement to closed cash register', function () {
    $cashRegister = CashRegister::factory()->closed()->create([
        'store_id' => $this->store->id,
        'opened_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('cash-registers.movements', $cashRegister), [
            'type' => 'deposito',
            'amount' => 100.00,
            'reason' => 'Depósito',
        ])
        ->assertSessionHasErrors(['error']);
});
