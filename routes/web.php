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

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - acceso para todos los roles
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ============================================
    // RUTAS SOLO ADMIN
    // ============================================
    Route::middleware(['role:admin'])->group(function () {
        // Usuarios
        Route::resource('users', UserController::class)->except(['show']);
        Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])
            ->name('users.toggle-active');

        // Tiendas
        Route::resource('stores', StoreController::class);
        Route::patch('stores/{store}/toggle-active', [StoreController::class, 'toggleActive'])
            ->name('stores.toggle-active');

        // Gastos
        Route::resource('expenses', ExpenseController::class);
        Route::post('expenses/{expense}/cancel', [ExpenseController::class, 'cancel'])
            ->name('expenses.cancel');

        // Cierre de caja y movimientos (solo admin)
        Route::post('cash-registers/{cashRegister}/close', [CashRegisterController::class, 'close'])
            ->name('cash-registers.close');
        Route::post('cash-registers/{cashRegister}/movements', [CashRegisterController::class, 'addMovement'])
            ->name('cash-registers.movements');

        // Cajas registradoras - ver listado (solo admin)
        Route::get('cash-registers', [CashRegisterController::class, 'index'])
            ->name('cash-registers.index');
    });

    // ============================================
    // RUTAS ADMIN Y BODEGA
    // ============================================
    Route::middleware(['role:admin,bodega'])->group(function () {
        // Categorías
        Route::resource('categories', CategoryController::class);
        Route::patch('categories/{category}/toggle-active', [CategoryController::class, 'toggleActive'])
            ->name('categories.toggle-active');

        // Productos
        Route::get('products/stock', [ProductController::class, 'stockManagement'])
            ->name('products.stock');
        Route::get('products/out-of-stock', [ProductController::class, 'outOfStock'])
            ->name('products.out-of-stock');
        Route::resource('products', ProductController::class);
        Route::patch('products/{product}/toggle-active', [ProductController::class, 'toggleActive'])
            ->name('products.toggle-active');
        Route::post('products/{product}/assign-store', [ProductController::class, 'assignToStore'])
            ->name('products.assign-store');

        // Transferencias de stock
        Route::resource('stock-transfers', StockTransferController::class)
            ->only(['index', 'create', 'store']);
        Route::get('stock-transfers/product-stock', [StockTransferController::class, 'getProductStock'])
            ->name('stock-transfers.product-stock');
    });

    // ============================================
    // RUTAS ADMIN Y VENDEDOR
    // ============================================
    Route::middleware(['role:admin,vendedor'])->group(function () {
        // Ventas (POS)
        Route::resource('sales', SaleController::class)->only(['index', 'create', 'store', 'show']);
        Route::get('stores/{store}/products', [SaleController::class, 'getProductsByStore'])
            ->name('stores.products');

        // Cajas registradoras - crear y abrir (admin y vendedor)
        Route::get('cash-registers/create', [CashRegisterController::class, 'create'])
            ->name('cash-registers.create');
        Route::post('cash-registers', [CashRegisterController::class, 'store'])
            ->name('cash-registers.store');
    });

    // Cajas registradoras - ver detalle (solo admin, debe ir después de /create)
    Route::get('cash-registers/{cashRegister}', [CashRegisterController::class, 'show'])
        ->middleware(['role:admin'])
        ->name('cash-registers.show');

    // Cancelar venta - solo admin
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])
        ->middleware(['role:admin'])
        ->name('sales.cancel');
});

require __DIR__.'/settings.php';
