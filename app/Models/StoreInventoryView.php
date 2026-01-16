<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreInventoryView extends Model
{
    protected $table = 'v_store_inventory';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'store_id' => 'integer',
        'product_id' => 'integer',
        'stock' => 'integer',
        'min_stock' => 'integer',
        'sale_price' => 'decimal:2',
        'inventory_value_cost' => 'decimal:2',
        'inventory_value_sale' => 'decimal:2',
    ];

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= min_stock');
    }

    public function scopeByStore($query, int $storeId)
    {
        return $query->where('store_id', $storeId);
    }
}
