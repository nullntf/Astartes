<?php

namespace App\Observers;

use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class SaleObserver
{
    public function updating(Sale $sale): void
    {
        if ($sale->isDirty('status') && $sale->status === 'anulada' && $sale->getOriginal('status') === 'completada') {
            $saleItems = $sale->items;
            
            foreach ($saleItems as $item) {
                DB::table('store_product')
                    ->where('store_id', $sale->store_id)
                    ->where('product_id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }
        }
    }
}
