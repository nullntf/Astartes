<?php

use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class)->except(['show']);
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])
        ->name('users.toggle-active');

    Route::resource('stores', StoreController::class);
    Route::patch('stores/{store}/toggle-active', [StoreController::class, 'toggleActive'])
        ->name('stores.toggle-active');

    Route::resource('categories', CategoryController::class);
    Route::patch('categories/{category}/toggle-active', [CategoryController::class, 'toggleActive'])
        ->name('categories.toggle-active');

    Route::get('products/stock', [ProductController::class, 'stockManagement'])
        ->name('products.stock');
    Route::get('products/out-of-stock', [ProductController::class, 'outOfStock'])
        ->name('products.out-of-stock');
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/toggle-active', [ProductController::class, 'toggleActive'])
        ->name('products.toggle-active');
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

    Route::resource('stock-transfers', StockTransferController::class)
        ->only(['index', 'create', 'store']);
    Route::get('stock-transfers/product-stock', [StockTransferController::class, 'getProductStock'])
        ->name('stock-transfers.product-stock');
});

require __DIR__.'/settings.php';
