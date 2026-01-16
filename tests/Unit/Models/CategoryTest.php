<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('category can be created with valid data', function () {
    $category = Category::factory()->create([
        'name' => 'Electrónicos',
        'is_active' => true,
    ]);

    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->name)->toBe('Electrónicos')
        ->and($category->is_active)->toBeTrue();
});

test('category has products relationship', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id]);

    expect($category->products)->toHaveCount(1)
        ->and($category->products->first()->id)->toBe($product->id);
});

test('category has created_by relationship', function () {
    $creator = User::factory()->create();
    $category = Category::factory()->create(['created_by' => $creator->id]);

    expect($category->createdBy)->toBeInstanceOf(User::class)
        ->and($category->createdBy->id)->toBe($creator->id);
});

test('category is_active is cast to boolean', function () {
    $category = Category::factory()->create(['is_active' => 1]);

    expect($category->is_active)->toBeBool()->toBeTrue();
});
