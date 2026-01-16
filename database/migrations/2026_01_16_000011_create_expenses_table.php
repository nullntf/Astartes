<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores');
            $table->foreignId('user_id')->constrained('users');
            $table->string('category', 100);
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['activo', 'anulado'])->default('activo');
            $table->foreignId('cancelled_by')->nullable()->constrained('users');
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->date('expense_date');
            $table->timestamps();
            
            $table->index('store_id');
            $table->index('status');
            $table->index('expense_date');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
