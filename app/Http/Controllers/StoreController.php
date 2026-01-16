<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $stores = Store::with(['createdBy', 'updatedBy'])
            ->latest()
            ->paginate(15);

        return Inertia::render('stores/index', [
            'stores' => $stores,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('stores/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:stores,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();

        $store = Store::create($validated);

        return redirect()->route('stores.index')
            ->with('success', 'Tienda creada exitosamente.');
    }

    public function show(Store $store): Response
    {
        $store->load(['products', 'users', 'cashRegisters']);

        return Inertia::render('stores/show', [
            'store' => $store,
        ]);
    }

    public function edit(Store $store): Response
    {
        return Inertia::render('stores/edit', [
            'store' => $store,
        ]);
    }

    public function update(Request $request, Store $store)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:stores,code,'.$store->id,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $validated['updated_by'] = auth()->id();

        $store->update($validated);

        return redirect()->route('stores.index')
            ->with('success', 'Tienda actualizada exitosamente.');
    }

    public function destroy(Store $store)
    {
        $store->delete();

        return redirect()->route('stores.index')
            ->with('success', 'Tienda eliminada exitosamente.');
    }
}
