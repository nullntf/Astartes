<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores');
            $table->foreignId('cash_register_id')->constrained('cash_registers');
            $table->foreignId('user_id')->constrained('users');
            $table->string('sale_number', 50)->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('payment_method', ['efectivo', 'tarjeta', 'transferencia', 'mixto']);
            $table->enum('status', ['completada', 'anulada'])->default('completada');
            $table->foreignId('cancelled_by')->nullable()->constrained('users');
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            
            $table->index('store_id');
            $table->index('cash_register_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('sale_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
