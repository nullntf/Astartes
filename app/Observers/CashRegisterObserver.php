<?php

namespace App\Observers;

use App\Models\CashRegister;
use Illuminate\Support\Facades\DB;

class CashRegisterObserver
{
    public function updating(CashRegister $cashRegister): void
    {
        if ($cashRegister->isDirty('status') && 
            $cashRegister->status === 'cerrada' && 
            $cashRegister->getOriginal('status') === 'abierta') {
            
            $totalVentas = DB::table('sales')
                ->where('cash_register_id', $cashRegister->id)
                ->where('status', 'completada')
                ->whereIn('payment_method', ['efectivo', 'mixto'])
                ->sum('total');

            $cashRegister->expected_balance = $cashRegister->opening_balance + ($totalVentas ?? 0);
            $cashRegister->difference = $cashRegister->closing_balance - $cashRegister->expected_balance;
        }
    }
}
