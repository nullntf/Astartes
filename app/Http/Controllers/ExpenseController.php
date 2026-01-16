<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $expenses = Expense::with(['store', 'user', 'cancelledBy'])
            ->when($request->store_id, function ($query, $storeId) {
                $query->where('store_id', $storeId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('expense_date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('expense_date', '<=', $dateTo);
            })
            ->latest('expense_date')
            ->paginate(15);

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
            'stores' => Store::where('is_active', true)->get(),
            'filters' => $request->only(['store_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('expenses/create', [
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string|max:200',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $expense = Expense::create([
                'store_id' => $validated['store_id'],
                'user_id' => auth()->id(),
                'category' => $validated['category'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'expense_date' => $validated['expense_date'],
                'status' => 'activo',
            ]);

            if (isset($validated['items']) && count($validated['items']) > 0) {
                foreach ($validated['items'] as $item) {
                    $expense->items()->create([
                        'description' => $item['description'],
                        'amount' => $item['amount'],
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            return redirect()->route('expenses.index')
                ->with('success', 'Gasto registrado exitosamente.');
        });
    }

    public function show(Expense $expense): Response
    {
        $expense->load(['store', 'user', 'items', 'cancelledBy']);

        return Inertia::render('expenses/show', [
            'expense' => $expense,
        ]);
    }

    public function edit(Expense $expense): Response
    {
        if ($expense->status === 'anulado') {
            return back()->withErrors(['error' => 'No se puede editar un gasto anulado.']);
        }

        $expense->load('items');

        return Inertia::render('expenses/edit', [
            'expense' => $expense,
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->status === 'anulado') {
            return back()->withErrors(['error' => 'No se puede actualizar un gasto anulado.']);
        }

        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string|max:200',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $expense) {
            $expense->update([
                'store_id' => $validated['store_id'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'expense_date' => $validated['expense_date'],
            ]);

            $expense->items()->delete();

            if (isset($validated['items']) && count($validated['items']) > 0) {
                foreach ($validated['items'] as $item) {
                    $expense->items()->create([
                        'description' => $item['description'],
                        'amount' => $item['amount'],
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            return redirect()->route('expenses.index')
                ->with('success', 'Gasto actualizado exitosamente.');
        });
    }

    public function cancel(Request $request, Expense $expense)
    {
        if ($expense->status === 'anulado') {
            return back()->withErrors(['error' => 'Este gasto ya está anulado.']);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $expense->update([
            'status' => 'anulado',
            'cancelled_by' => auth()->id(),
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return redirect()->route('expenses.show', $expense)
            ->with('success', 'Gasto anulado exitosamente.');
    }
}
