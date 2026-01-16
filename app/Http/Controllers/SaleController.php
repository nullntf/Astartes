<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $sales = Sale::with(['store', 'user', 'cashRegister'])
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

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'stores' => Store::where('is_active', true)->get(),
            'filters' => $request->only(['store_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create(): Response
    {
        $stores = Store::where('is_active', true)->get();
        $openCashRegisters = CashRegister::where('status', 'abierta')
            ->with('store')
            ->get();

        return Inertia::render('sales/create', [
            'stores' => $stores,
            'cashRegisters' => $openCashRegisters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'cash_register_id' => 'required|exists:cash_registers,id',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,mixto',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

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

            foreach ($validated['items'] as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'created_by' => auth()->id(),
                ]);
            }

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta registrada exitosamente.');
        });
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['store', 'user', 'cashRegister', 'items.product', 'cancelledBy']);

        return Inertia::render('sales/show', [
            'sale' => $sale,
        ]);
    }

    public function cancel(Request $request, Sale $sale)
    {
        if ($sale->status === 'anulada') {
            return back()->withErrors(['error' => 'Esta venta ya está anulada.']);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $sale->update([
            'status' => 'anulada',
            'cancelled_by' => auth()->id(),
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return redirect()->route('sales.show', $sale)
            ->with('success', 'Venta anulada exitosamente.');
    }

    private function generateSaleNumber(): string
    {
        $lastSale = Sale::latest('id')->first();
        $nextNumber = $lastSale ? ((int) substr($lastSale->sale_number, 3)) + 1 : 1;
        
        return 'VTA' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }

    public function getProductsByStore(Store $store)
    {
        $products = $store->products()
            ->where('is_active', true)
            ->withPivot('stock', 'sale_price')
            ->get();

        return response()->json($products);
    }
}
