<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailySalesSummaryView extends Model
{
    protected $table = 'v_daily_sales_summary';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'store_id' => 'integer',
        'sale_date' => 'date',
        'total_sales' => 'integer',
        'total_revenue' => 'decimal:2',
        'total_cancelled' => 'decimal:2',
    ];

    public function scopeByStore($query, int $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('sale_date', [$startDate, $endDate]);
    }

    public function scopeCurrentMonth($query)
    {
        return $query->whereYear('sale_date', now()->year)
                     ->whereMonth('sale_date', now()->month);
    }
}
