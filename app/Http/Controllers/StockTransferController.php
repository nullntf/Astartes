<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Store;
use App\Models\StockTransfer;
use App\Services\ProductStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function index(): Response
    {
        $transfers = StockTransfer::with(['fromStore', 'toStore', 'product', 'createdBy'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('stock-transfers/index', [
            'transfers' => $transfers,
        ]);
    }

    public function create(): Response
    {
        $stores = Store::where('is_active', true)->get();
        $products = Product::with(['stores' => function ($query) {
            $query->withPivot('stock', 'min_stock');
        }])->where('is_active', true)->get();

        return Inertia::render('stock-transfers/create', [
            'stores' => $stores,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_store_id' => 'required|exists:stores,id',
            'to_store_id' => 'required|exists:stores,id|different:from_store_id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $fromStore = Store::findOrFail($validated['from_store_id']);
        $toStore = Store::findOrFail($validated['to_store_id']);
        $product = Product::findOrFail($validated['product_id']);

        // Verificar stock disponible en tienda origen
        $fromStoreProduct = $fromStore->products()->where('product_id', $product->id)->first();
        
        if (!$fromStoreProduct) {
            return back()->withErrors([
                'from_store_id' => 'El producto no está asignado a la tienda de origen.',
            ]);
        }

        $availableStock = $fromStoreProduct->pivot->stock;

        if ($availableStock < $validated['quantity']) {
            return back()->withErrors([
                'quantity' => "Stock insuficiente. Disponible: {$availableStock} unidades.",
            ]);
        }

        DB::transaction(function () use ($fromStore, $toStore, $product, $validated, $fromStoreProduct) {
            // Restar stock de tienda origen
            $fromStore->products()->updateExistingPivot($product->id, [
                'stock' => DB::raw("stock - {$validated['quantity']}"),
            ]);

            // Verificar si producto ya está en tienda destino
            $toStoreProduct = $toStore->products()->where('product_id', $product->id)->first();

            if ($toStoreProduct) {
                // Sumar stock a tienda destino
                $toStore->products()->updateExistingPivot($product->id, [
                    'stock' => DB::raw("stock + {$validated['quantity']}"),
                ]);
            } else {
                // Crear relación con tienda destino, copiando min_stock de origen
                $toStore->products()->attach($product->id, [
                    'stock' => $validated['quantity'],
                    'min_stock' => $fromStoreProduct->pivot->min_stock,
                    'created_by' => auth()->id(),
                ]);
            }

            // Registrar transferencia
            StockTransfer::create([
                'from_store_id' => $validated['from_store_id'],
                'to_store_id' => $validated['to_store_id'],
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);
        });

        // Actualizar estado activo del producto basado en stock total
        $stockService = new ProductStockService();
        $stockService->updateProductActiveStatus($product->fresh());

        return redirect()->route('stock-transfers.index')
            ->with('success', "Transferencia de {$validated['quantity']} unidades de {$product->name} realizada exitosamente.");
    }

    public function getProductStock(Request $request)
    {
        $storeId = $request->query('store_id');
        $productId = $request->query('product_id');

        if (!$storeId || !$productId) {
            return response()->json(['stock' => 0]);
        }

        $store = Store::find($storeId);
        if (!$store) {
            return response()->json(['stock' => 0]);
        }

        $product = $store->products()->where('product_id', $productId)->first();
        
        return response()->json([
            'stock' => $product ? $product->pivot->stock : 0,
        ]);
    }
}
