<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'role',
        'store_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function openedCashRegisters(): HasMany
    {
        return $this->hasMany(CashRegister::class, 'opened_by');
    }

    public function closedCashRegisters(): HasMany
    {
        return $this->hasMany(CashRegister::class, 'closed_by');
    }

    public function cashMovements(): HasMany
    {
        return $this->hasMany(CashMovement::class);
    }

    public function stockTransfers(): HasMany
    {
        return $this->hasMany(StockTransfer::class, 'created_by');
    }

    public function canBeDeleted(): bool
    {
        return empty($this->getDeletionBlockers());
    }

    public function getDeletionBlockers(): array
    {
        $blockers = [];

        if ($this->sales()->exists()) {
            $blockers[] = 'Tiene ventas registradas';
        }

        if ($this->expenses()->exists()) {
            $blockers[] = 'Tiene gastos registrados';
        }

        if ($this->openedCashRegisters()->exists()) {
            $blockers[] = 'Ha abierto cajas registradoras';
        }

        if ($this->stockTransfers()->exists()) {
            $blockers[] = 'Ha realizado transferencias de stock';
        }

        return $blockers;
    }
}
