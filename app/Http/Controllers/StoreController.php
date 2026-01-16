<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequest;
use App\Models\Store;
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

    public function store(StoreRequest $request)
    {
        $validated = $request->validated();
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

    public function update(StoreRequest $request, Store $store)
    {
        $validated = $request->validated();
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
