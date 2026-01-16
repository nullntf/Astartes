<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('id');
            $table->enum('role', ['admin', 'bodega', 'vendedor'])->after('password');
            $table->foreignId('store_id')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('store_id');
            
            $table->index('role');
            $table->index('store_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['store_id']);
            $table->dropIndex(['is_active']);
            
            $table->dropColumn(['username', 'role', 'store_id', 'is_active']);
        });
    }
};
