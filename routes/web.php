<?php

use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('stores', StoreController::class);

    Route::resource('categories', CategoryController::class);

    Route::resource('products', ProductController::class);
    Route::post('products/{product}/assign-store', [ProductController::class, 'assignToStore'])
        ->name('products.assign-store');

    Route::resource('sales', SaleController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
    Route::get('stores/{store}/products', [SaleController::class, 'getProductsByStore'])
        ->name('stores.products');

    Route::resource('cash-registers', CashRegisterController::class)
        ->only(['index', 'create', 'store', 'show']);
    Route::post('cash-registers/{cashRegister}/close', [CashRegisterController::class, 'close'])
        ->name('cash-registers.close');
    Route::post('cash-registers/{cashRegister}/movements', [CashRegisterController::class, 'addMovement'])
        ->name('cash-registers.movements');

    Route::resource('expenses', ExpenseController::class);
    Route::post('expenses/{expense}/cancel', [ExpenseController::class, 'cancel'])
        ->name('expenses.cancel');
});

require __DIR__.'/settings.php';
