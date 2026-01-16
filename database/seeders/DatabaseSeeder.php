<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario administrador inicial
        User::factory()->create([
            'username' => 'admin',
            'name' => 'Administrador',
            'email' => 'admin@astartes.com',
            'password' => 'password', // Cambiar en producción
            'role' => 'admin',
            'store_id' => null,
            'is_active' => true,
        ]);
    }
}
