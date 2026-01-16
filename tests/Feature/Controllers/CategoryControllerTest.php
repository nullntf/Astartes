<?php

use App\Models\Category;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->withoutVite();
});

test('guest cannot access categories', function () {
    $this->get(route('categories.index'))
        ->assertRedirect(route('login'));
});

test('authenticated user can view categories index', function () {
    Category::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('categories.index'))
        ->assertOk();
});

test('authenticated user can create a category', function () {
    $categoryData = [
        'name' => 'Electrónicos',
        'description' => 'Productos electrónicos',
        'is_active' => true,
    ];

    $this->actingAs($this->user)
        ->post(route('categories.store'), $categoryData)
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Electrónicos',
        'created_by' => $this->user->id,
    ]);
});

test('category creation requires name', function () {
    $this->actingAs($this->user)
        ->post(route('categories.store'), [])
        ->assertSessionHasErrors(['name']);
});

test('authenticated user can update a category', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->user)
        ->put(route('categories.update', $category), [
            'name' => 'Categoría Actualizada',
        ])
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Categoría Actualizada',
        'updated_by' => $this->user->id,
    ]);
});

test('authenticated user can delete a category', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('categories.destroy', $category))
        ->assertRedirect(route('categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
