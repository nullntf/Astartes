<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashRegisterController extends Controller
{
    public function index(Request $request): Response
    {
        $cashRegisters = CashRegister::with(['store', 'openedBy', 'closedBy'])
            ->when($request->store_id, function ($query, $storeId) {
                $query->where('store_id', $storeId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('opened_at')
            ->paginate(15);

        return Inertia::render('cash-registers/index', [
            'cashRegisters' => $cashRegisters,
            'stores' => Store::where('is_active', true)->get(),
            'filters' => $request->only(['store_id', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cash-registers/create', [
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'opening_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $openRegister = CashRegister::where('store_id', $validated['store_id'])
            ->where('status', 'abierta')
            ->exists();

        if ($openRegister) {
            return back()->withErrors(['error' => 'Ya existe una caja abierta para esta tienda.']);
        }

        $cashRegister = CashRegister::create([
            'store_id' => $validated['store_id'],
            'opened_by' => auth()->id(),
            'opened_at' => now(),
            'opening_balance' => $validated['opening_balance'],
            'status' => 'abierta',
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('cash-registers.show', $cashRegister)
            ->with('success', 'Caja abierta exitosamente.');
    }

    public function show(CashRegister $cashRegister): Response
    {
        $cashRegister->load([
            'store',
            'openedBy',
            'closedBy',
            'sales' => function ($query) {
                $query->where('status', 'completada')->latest();
            },
            'cashMovements' => function ($query) {
                $query->latest();
            },
        ]);

        $totalSales = $cashRegister->sales()
            ->where('status', 'completada')
            ->whereIn('payment_method', ['efectivo', 'mixto'])
            ->sum('total');

        $totalDeposits = $cashRegister->cashMovements()
            ->where('type', 'deposito')
            ->sum('amount');

        $totalWithdrawals = $cashRegister->cashMovements()
            ->where('type', 'retiro')
            ->sum('amount');

        return Inertia::render('cash-registers/show', [
            'cashRegister' => $cashRegister,
            'totalSales' => $totalSales,
            'totalDeposits' => $totalDeposits,
            'totalWithdrawals' => $totalWithdrawals,
            'currentBalance' => $cashRegister->opening_balance + $totalSales + $totalDeposits - $totalWithdrawals,
        ]);
    }

    public function close(Request $request, CashRegister $cashRegister)
    {
        if ($cashRegister->status === 'cerrada') {
            return back()->withErrors(['error' => 'Esta caja ya está cerrada.']);
        }

        $validated = $request->validate([
            'closing_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $cashRegister->update([
            'status' => 'cerrada',
            'closed_by' => auth()->id(),
            'closed_at' => now(),
            'closing_balance' => $validated['closing_balance'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('cash-registers.show', $cashRegister)
            ->with('success', 'Caja cerrada exitosamente.');
    }

    public function addMovement(Request $request, CashRegister $cashRegister)
    {
        if ($cashRegister->status === 'cerrada') {
            return back()->withErrors(['error' => 'No se pueden agregar movimientos a una caja cerrada.']);
        }

        $validated = $request->validate([
            'type' => 'required|in:deposito,retiro',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
        ]);

        $cashRegister->cashMovements()->create([
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Movimiento registrado exitosamente.');
    }
}
