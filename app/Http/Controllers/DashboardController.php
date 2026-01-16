<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterStatusView;
use App\Models\DailySalesSummaryView;
use App\Models\StoreInventoryView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $storeId = $user->role === 'vendedor' ? $user->store_id : $request->store_id;

        $todaySales = DailySalesSummaryView::whereDate('sale_date', today())
            ->when($storeId, fn($q) => $q->byStore($storeId))
            ->get();

        $monthlySales = DailySalesSummaryView::currentMonth()
            ->when($storeId, fn($q) => $q->byStore($storeId))
            ->get();

        $lowStockProducts = StoreInventoryView::lowStock()
            ->when($storeId, fn($q) => $q->byStore($storeId))
            ->limit(10)
            ->get();

        $openCashRegisters = CashRegisterStatusView::open()
            ->when($storeId, fn($q) => $q->where('store_id', $storeId))
            ->get();

        return Inertia::render('dashboard', [
            'todaySales' => $todaySales,
            'monthlySales' => $monthlySales,
            'lowStockProducts' => $lowStockProducts,
            'openCashRegisters' => $openCashRegisters,
            'totalRevenue' => $todaySales->sum('total_revenue'),
            'totalSales' => $todaySales->sum('total_sales'),
        ]);
    }
}
