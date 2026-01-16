<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores');
            $table->foreignId('opened_by')->constrained('users');
            $table->timestamp('opened_at')->useCurrent();
            $table->decimal('opening_balance', 10, 2)->default(0);
            $table->foreignId('closed_by')->nullable()->constrained('users');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('closing_balance', 10, 2)->nullable();
            $table->decimal('expected_balance', 10, 2)->nullable();
            $table->decimal('difference', 10, 2)->nullable();
            $table->enum('status', ['abierta', 'cerrada'])->default('abierta');
            $table->text('notes')->nullable();
            
            $table->index('store_id');
            $table->index('status');
            $table->index('opened_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_registers');
    }
};
