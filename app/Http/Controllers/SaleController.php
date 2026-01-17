<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelRequest;
use App\Http\Requests\SaleRequest;
use App\Models\CashRegister;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Store;
use App\Services\ProductStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(
        private ProductStockService $stockService
    ) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        $salesQuery = Sale::with(['store', 'user', 'cashRegister', 'items.product']);

        // Vendedor solo ve sus propias ventas
        if ($user->isVendedor()) {
            $salesQuery->where('user_id', $user->id);
        }

        $sales = $salesQuery
            ->when($request->store_id, function ($query, $storeId) {
                $query->where('store_id', $storeId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->latest()
            ->paginate(15);

        // Solo admin ve todas las tiendas en filtros
        $stores = $isAdmin
            ? Store::where('is_active', true)->get()
            : collect();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'stores' => $stores,
            'filters' => $request->only(['store_id', 'status', 'date_from', 'date_to']),
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();

        // Verificar que el usuario tenga caja abierta
        $openCashRegister = $this->getAccessibleOpenCashRegister($user);

        if (!$openCashRegister) {
            return Inertia::render('sales/no-cash-register', [
                'message' => 'Debes abrir una caja antes de realizar ventas.',
                'canOpenCashRegister' => true,
            ]);
        }

        // Obtener productos de la tienda de la caja
        $store = $openCashRegister->store;
        $products = $store->products()
            ->where('is_active', true)
            ->wherePivot('stock', '>', 0)
            ->with('category')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'category' => $product->category->name,
                    'sale_price' => (float) $product->sale_price,
                    'cost_price' => (float) $product->cost_price,
                    'stock' => $product->pivot->stock,
                ];
            });

        return Inertia::render('sales/pos', [
            'store' => $store,
            'cashRegister' => $openCashRegister,
            'products' => $products,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function store(SaleRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated) {
            $subtotal = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $tax = $validated['tax'] ?? 0;
            $discount = $validated['discount'] ?? 0;
            $total = $subtotal + $tax - $discount;

            $sale = Sale::create([
                'store_id' => $validated['store_id'],
                'cash_register_id' => $validated['cash_register_id'],
                'user_id' => auth()->id(),
                'sale_number' => $this->generateSaleNumber(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'completada',
            ]);

            $store = Store::find($validated['store_id']);

            foreach ($validated['items'] as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'created_by' => auth()->id(),
                ]);

                // Stock se reduce automáticamente en SaleItemObserver::created()

                // Actualizar estado activo del producto
                $product = Product::find($item['product_id']);
                $this->stockService->updateProductActiveStatus($product);
            }

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta registrada exitosamente.');
        });
    }

    public function show(Sale $sale): Response
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        // Vendedor solo puede ver sus propias ventas
        if ($user->isVendedor() && $sale->user_id !== $user->id) {
            abort(403, 'No tienes permiso para ver esta venta.');
        }

        $sale->load(['store', 'user', 'cashRegister', 'items.product.category', 'cancelledBy']);

        // Calcular datos financieros para admin
        $financialData = null;
        if ($isAdmin) {
            $financialData = $this->calculateFinancialData($sale);
        }

        return Inertia::render('sales/show', [
            'sale' => $sale,
            'isAdmin' => $isAdmin,
            'financialData' => $financialData,
        ]);
    }

    public function cancel(CancelRequest $request, Sale $sale)
    {
        $user = auth()->user();

        // Solo admin puede anular ventas
        if (!$user->isAdmin()) {
            abort(403, 'Solo los administradores pueden anular ventas.');
        }

        if ($sale->status === 'anulada') {
            return back()->withErrors(['error' => 'Esta venta ya está anulada.']);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($sale, $validated) {
            $sale->update([
                'status' => 'anulada',
                'cancelled_by' => auth()->id(),
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['cancellation_reason'],
            ]);

            // Stock se restaura automáticamente en SaleObserver::updating()

            // Actualizar estado de productos si es necesario
            foreach ($sale->items as $item) {
                $this->stockService->updateProductActiveStatus(
                    Product::find($item->product_id)
                );
            }
        });

        return redirect()->route('sales.show', $sale)
            ->with('success', 'Venta anulada exitosamente. Stock restaurado.');
    }

    private function generateSaleNumber(): string
    {
        $lastSale = Sale::latest('id')->first();
        $nextNumber = $lastSale ? ((int) substr($lastSale->sale_number, 3)) + 1 : 1;
        
        return 'VTA' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }

    private function getAccessibleOpenCashRegister($user): ?CashRegister
    {
        $query = CashRegister::where('status', 'abierta')->with('store');

        if ($user->isVendedor()) {
            // Vendedor: solo cajas abiertas de su tienda que él haya abierto
            return $query
                ->where('store_id', $user->store_id)
                ->where('opened_by', $user->id)
                ->first();
        }

        // Admin/Bodega: cajas que ellos hayan abierto
        return $query->where('opened_by', $user->id)->first();
    }

    private function calculateFinancialData(Sale $sale): array
    {
        $items = $sale->items->map(function ($item) {
            $costPrice = (float) $item->product->cost_price;
            $salePrice = (float) $item->unit_price;
            $quantity = $item->quantity;
            
            $totalCost = $costPrice * $quantity;
            $totalSale = $salePrice * $quantity;
            $profit = $totalSale - $totalCost;
            $margin = $totalSale > 0 ? ($profit / $totalSale) * 100 : 0;

            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'quantity' => $quantity,
                'cost_price' => $costPrice,
                'sale_price' => $salePrice,
                'total_cost' => $totalCost,
                'total_sale' => $totalSale,
                'profit' => $profit,
                'margin_percent' => round($margin, 2),
            ];
        });

        $totalCost = $items->sum('total_cost');
        $totalSale = (float) $sale->subtotal;
        $totalProfit = $totalSale - $totalCost;
        $totalMargin = $totalSale > 0 ? ($totalProfit / $totalSale) * 100 : 0;

        return [
            'items' => $items->toArray(),
            'summary' => [
                'total_cost' => round($totalCost, 2),
                'subtotal' => round($totalSale, 2),
                'tax' => (float) $sale->tax,
                'discount' => (float) $sale->discount,
                'total' => (float) $sale->total,
                'total_profit' => round($totalProfit, 2),
                'margin_percent' => round($totalMargin, 2),
            ],
        ];
    }

    public function getProductsByStore(Store $store)
    {
        $user = auth()->user();

        // Verificar acceso a la tienda
        if (!$user->canAccessStore($store->id)) {
            abort(403, 'No tienes acceso a esta tienda.');
        }

        $products = $store->products()
            ->where('is_active', true)
            ->wherePivot('stock', '>', 0)
            ->with('category')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'category' => $product->category->name,
                    'sale_price' => (float) $product->sale_price,
                    'stock' => $product->pivot->stock,
                ];
            });

        return response()->json($products);
    }
}
