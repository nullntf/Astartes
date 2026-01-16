<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
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

        return back()->with('success', 'Producto asignado a la tienda exitosamente.');
    }
}
