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

        $stores->getCollection()->transform(function ($store) {
            $store->can_be_deleted = $store->canBeDeleted();
            $store->deletion_blockers = $store->getDeletionBlockers();
            return $store;
        });

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
        if (!$store->canBeDeleted()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar esta tienda: ' . implode(', ', $store->getDeletionBlockers())
            ]);
        }

        $store->delete();

        return redirect()->route('stores.index')
            ->with('success', 'Tienda eliminada exitosamente.');
    }

    public function toggleActive(Store $store)
    {
        $store->update([
            'is_active' => !$store->is_active,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Estado de la tienda actualizado.');
    }
}
