<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite no soporta ALTER TABLE para foreign keys
        // La protección de integridad está implementada en los controladores con canBeDeleted()
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Agregar restricción a products.category_id
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreign('category_id')
                  ->references('id')
                  ->on('categories')
                  ->onDelete('restrict');
        });

        // Agregar restricción a sale_items.product_id
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('restrict');
        });

        // Agregar restricción a sales.store_id
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores')
                  ->onDelete('restrict');
        });

        // Agregar restricción a sales.user_id
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');
        });

        // Agregar restricción a cash_registers.store_id
        Schema::table('cash_registers', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores')
                  ->onDelete('restrict');
        });

        // Agregar restricción a expenses.store_id
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores')
                  ->onDelete('restrict');
        });

        // Cambiar store_product de cascade a restrict
        Schema::table('store_product', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['product_id']);
            
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores')
                  ->onDelete('restrict');
            
            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Revertir products.category_id
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreign('category_id')
                  ->references('id')
                  ->on('categories');
        });

        // Revertir sale_items.product_id
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')
                  ->references('id')
                  ->on('products');
        });

        // Revertir sales.store_id
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores');
        });

        // Revertir sales.user_id
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users');
        });

        // Revertir cash_registers.store_id
        Schema::table('cash_registers', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores');
        });

        // Revertir expenses.store_id
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores');
        });

        // Revertir store_product
        Schema::table('store_product', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['product_id']);
            
            $table->foreign('store_id')
                  ->references('id')
                  ->on('stores')
                  ->onDelete('cascade');
            
            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');
        });
    }
};
