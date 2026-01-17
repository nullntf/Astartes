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
        // Corregir usuario admin@ast.com si existe (password sin hashear)
        $existingAdmin = User::where('email', 'admin@ast.com')->first();
        if ($existingAdmin) {
            $existingAdmin->update([
                'password' => Hash::make('Astartes2026!'),
                'email_verified_at' => $existingAdmin->email_verified_at ?? now(),
            ]);
        }

        // Crear usuario admin@astartes.com si no existe
        if (!User::where('email', 'admin@astartes.com')->exists()) {
            User::create([
                'username' => 'admin',
                'name' => 'Administrador',
                'email' => 'admin@astartes.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Astartes2026!'),
                'role' => 'admin',
                'store_id' => null,
                'is_active' => true,
            ]);
        }
    }
}
