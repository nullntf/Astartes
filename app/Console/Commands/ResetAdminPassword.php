<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    protected $signature = 'admin:reset-password';
    protected $description = 'Reset admin user password to default';

    public function handle(): int
    {
        $admin = User::where('email', 'admin@astartes.com')->first();

        if (!$admin) {
            // Si no existe, crear el usuario admin
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
            $this->info('Admin user created successfully.');
        } else {
            // Si existe, actualizar el password
            $admin->update([
                'password' => Hash::make('Astartes2026!'),
                'email_verified_at' => $admin->email_verified_at ?? now(),
            ]);
            $this->info('Admin password reset successfully.');
        }

        $this->info('Email: admin@astartes.com');
        $this->info('Password: Astartes2026!');

        return Command::SUCCESS;
    }
}
