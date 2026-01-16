<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashRegisterStatusView extends Model
{
    protected $table = 'v_cash_register_status';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'id' => 'integer',
        'opened_at' => 'datetime',
        'opening_balance' => 'decimal:2',
        'closed_at' => 'datetime',
        'closing_balance' => 'decimal:2',
        'expected_balance' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function scopeOpen($query)
    {
        return $query->where('status', 'abierta');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'cerrada');
    }

    public function scopeByStore($query, string $storeName)
    {
        return $query->where('store_name', $storeName);
    }

    public function scopeWithDiscrepancy($query)
    {
        return $query->whereNotNull('difference')
                     ->whereRaw('ABS(difference) > 0');
    }
}
