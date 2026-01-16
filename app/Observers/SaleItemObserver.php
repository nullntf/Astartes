<?php

namespace App\Observers;

use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;

class SaleItemObserver
{
    public function created(SaleItem $saleItem): void
    {
        $sale = $saleItem->sale;
        
        DB::table('store_product')
            ->where('store_id', $sale->store_id)
            ->where('product_id', $saleItem->product_id)
            ->decrement('stock', $saleItem->quantity);
    }

    public function deleted(SaleItem $saleItem): void
    {
        $sale = $saleItem->sale;
        
        DB::table('store_product')
            ->where('store_id', $sale->store_id)
            ->where('product_id', $saleItem->product_id)
            ->increment('stock', $saleItem->quantity);
    }
}
