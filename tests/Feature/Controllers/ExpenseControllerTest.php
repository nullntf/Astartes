<?php

use App\Models\Expense;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->store = Store::factory()->create();
    $this->withoutVite();
});

test('guest cannot access expenses', function () {
    $this->get(route('expenses.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view expenses index', function () {
    Expense::factory()->count(3)->create([
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('expenses.index'))
        ->assertOk();
});

test('authenticated user can create an expense', function () {
    $expenseData = [
        'store_id' => $this->store->id,
        'category' => 'servicios',
        'description' => 'Pago de electricidad',
        'amount' => 500.00,
        'expense_date' => now()->format('Y-m-d'),
    ];

    $this->actingAs($this->user)
        ->post(route('expenses.store'), $expenseData)
        ->assertRedirect(route('expenses.index'));

    $this->assertDatabaseHas('expenses', [
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
        'category' => 'servicios',
        'amount' => 500.00,
    ]);
});

test('expense creation requires valid data', function () {
    $this->actingAs($this->user)
        ->post(route('expenses.store'), [])
        ->assertSessionHasErrors(['store_id', 'category', 'description', 'amount', 'expense_date']);
});

test('authenticated user can update an expense', function () {
    $expense = Expense::factory()->create([
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
        'status' => 'activo',
    ]);

    $this->actingAs($this->user)
        ->put(route('expenses.update', $expense), [
            'store_id' => $this->store->id,
            'category' => 'mantenimiento',
            'description' => 'Reparación de equipo',
            'amount' => 750.00,
            'expense_date' => now()->format('Y-m-d'),
        ])
        ->assertRedirect(route('expenses.index'));

    $this->assertDatabaseHas('expenses', [
        'id' => $expense->id,
        'category' => 'mantenimiento',
        'amount' => 750.00,
    ]);
});

test('cannot update cancelled expense', function () {
    $expense = Expense::factory()->cancelled()->create([
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('expenses.update', $expense), [
            'store_id' => $this->store->id,
            'category' => 'servicios',
            'description' => 'Nuevo gasto',
            'amount' => 100.00,
            'expense_date' => now()->format('Y-m-d'),
        ])
        ->assertSessionHasErrors(['error']);
});

test('authenticated user can cancel an expense', function () {
    $expense = Expense::factory()->create([
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
        'status' => 'activo',
    ]);

    $this->actingAs($this->user)
        ->post(route('expenses.cancel', $expense), [
            'cancellation_reason' => 'Error en el registro',
        ])
        ->assertRedirect(route('expenses.show', $expense));

    $this->assertDatabaseHas('expenses', [
        'id' => $expense->id,
        'status' => 'anulado',
        'cancelled_by' => $this->user->id,
    ]);
});

test('cannot cancel already cancelled expense', function () {
    $expense = Expense::factory()->cancelled()->create([
        'store_id' => $this->store->id,
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('expenses.cancel', $expense), [
            'cancellation_reason' => 'Otro motivo',
        ])
        ->assertSessionHasErrors(['error']);
});
