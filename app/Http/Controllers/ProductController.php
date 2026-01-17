<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Services\ProductStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::with(['category', 'createdBy', 'updatedBy'])
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15);

        $products->getCollection()->transform(function ($product) {
            $product->can_be_deleted = $product->canBeDeleted();
            $product->deletion_blockers = $product->getDeletionBlockers();
            $product->total_stock = $product->getTotalStock();
            return $product;
        });

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Category::where('is_active', true)->get(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create', [
            'categories' => Category::where('is_active', true)->get(),
        ]);
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();

        $product = Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function show(Product $product): Response
    {
        $product->load(['category', 'stores' => function ($query) {
            $query->withPivot('stock', 'min_stock');
        }]);

        return Inertia::render('products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->get(),
        ]);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['updated_by'] = auth()->id();

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $product)
    {
        if (!$product->canBeDeleted()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar este producto: ' . implode(', ', $product->getDeletionBlockers())
            ]);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    public function assignToStore(Request $request, Product $product)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
        ]);

        $product->stores()->syncWithoutDetaching([
            $validated['store_id'] => [
                'stock' => $validated['stock'],
                'min_stock' => $validated['min_stock'],
                'created_by' => auth()->id(),
            ],
        ]);

        // Actualizar estado activo del producto basado en stock total
        $stockService = new ProductStockService();
        $stockService->updateProductActiveStatus($product->fresh());

        return back()->with('success', 'Producto asignado a la tienda exitosamente.');
    }

    public function toggleActive(Product $product)
    {
        $product->update([
            'is_active' => !$product->is_active,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Estado del producto actualizado.');
    }

    public function stockManagement(): Response
    {
        $products = Product::with(['stores' => function ($query) {
            $query->withPivot('stock', 'min_stock');
        }])->where('is_active', true)->get();

        $stores = Store::where('is_active', true)->get();

        return Inertia::render('products/stock', [
            'products' => $products,
            'stores' => $stores,
        ]);
    }

    public function outOfStock(): Response
    {
        // Obtener todas las relaciones producto-tienda con stock 0
        $outOfStockItems = DB::table('store_product')
            ->join('products', 'store_product.product_id', '=', 'products.id')
            ->join('stores', 'store_product.store_id', '=', 'stores.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('store_product.stock', '=', 0)
            ->where('stores.is_active', true)
            ->select(
                'products.id as product_id',
                'products.sku',
                'products.name as product_name',
                'products.sale_price',
                'products.is_active',
                'categories.id as category_id',
                'categories.name as category_name',
                'stores.id as store_id',
                'stores.name as store_name',
                'stores.code as store_code',
                'store_product.min_stock'
            )
            ->orderBy('products.name')
            ->orderBy('stores.name')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'id' => $first->product_id,
                    'sku' => $first->sku,
                    'name' => $first->product_name,
                    'sale_price' => $first->sale_price,
                    'is_active' => (bool) $first->is_active,
                    'category' => [
                        'id' => $first->category_id,
                        'name' => $first->category_name,
                    ],
                    'stores_out_of_stock' => $items->map(function ($item) {
                        return [
                            'id' => $item->store_id,
                            'name' => $item->store_name,
                            'code' => $item->store_code,
                            'min_stock' => $item->min_stock,
                        ];
                    })->values()->all(),
                ];
            })
            ->values();

        return Inertia::render('products/out-of-stock', [
            'products' => $outOfStockItems,
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }
}
