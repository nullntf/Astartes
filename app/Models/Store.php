<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'store_product')
            ->withPivot('stock', 'min_stock', 'created_by', 'updated_by')
            ->withTimestamps();
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'store_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function cashRegisters(): HasMany
    {
        return $this->hasMany(CashRegister::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function stockTransfersFrom(): HasMany
    {
        return $this->hasMany(StockTransfer::class, 'from_store_id');
    }

    public function stockTransfersTo(): HasMany
    {
        return $this->hasMany(StockTransfer::class, 'to_store_id');
    }

    public function canBeDeleted(): bool
    {
        return empty($this->getDeletionBlockers());
    }

    public function getDeletionBlockers(): array
    {
        $blockers = [];

        if ($this->products()->exists()) {
            $blockers[] = 'Tiene productos asignados';
        }

        if ($this->sales()->exists()) {
            $blockers[] = 'Tiene ventas registradas';
        }

        if ($this->cashRegisters()->exists()) {
            $blockers[] = 'Tiene cajas registradas';
        }

        if ($this->expenses()->exists()) {
            $blockers[] = 'Tiene gastos registrados';
        }

        if ($this->users()->exists()) {
            $blockers[] = 'Tiene usuarios asignados';
        }

        if ($this->stockTransfersFrom()->exists() || $this->stockTransfersTo()->exists()) {
            $blockers[] = 'Tiene transferencias de stock';
        }

        return $blockers;
    }
}
