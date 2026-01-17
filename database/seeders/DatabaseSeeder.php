<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario administrador inicial solo si no existe
        if (!User::where('email', 'admin@astartes.com')->exists()) {
            User::create([
                'username' => 'admin',
                'name' => 'Administrador',
                'email' => 'admin@astartes.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Astartes2026!'), // Password hasheado correctamente
                'role' => 'admin',
                'store_id' => null,
                'is_active' => true,
            ]);
        }
    }
}
