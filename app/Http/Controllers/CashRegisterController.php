<?php

namespace App\Http\Controllers;

use App\Http\Requests\CashMovementRequest;
use App\Http\Requests\CashRegisterCloseRequest;
use App\Http\Requests\CashRegisterRequest;
use App\Models\CashRegister;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashRegisterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        $query = CashRegister::with(['store', 'openedBy', 'closedBy']);

        // Vendedor solo ve cajas de su tienda
        if ($user->isVendedor()) {
            $query->where('store_id', $user->store_id)
                  ->where('opened_by', $user->id);
        }

        $cashRegisters = $query
            ->when($request->store_id, function ($query, $storeId) {
                $query->where('store_id', $storeId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('opened_at')
            ->paginate(15);

        // Solo admin ve todas las tiendas en filtros
        $stores = $isAdmin
            ? Store::where('is_active', true)->get()
            : collect();

        return Inertia::render('cash-registers/index', [
            'cashRegisters' => $cashRegisters,
            'stores' => $stores,
            'filters' => $request->only(['store_id', 'status']),
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        // Verificar si el usuario ya tiene una caja abierta
        $existingOpenRegister = $user->getOpenCashRegister();
        if ($existingOpenRegister) {
            return redirect()->route('cash-registers.show', $existingOpenRegister)
                ->with('info', 'Ya tienes una caja abierta.');
        }

        // Vendedor solo puede abrir caja en su tienda
        if ($user->isVendedor()) {
            $stores = Store::where('id', $user->store_id)
                ->where('is_active', true)
                ->get();
        } else {
            $stores = Store::where('is_active', true)->get();
        }

        return Inertia::render('cash-registers/create', [
            'stores' => $stores,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(CashRegisterRequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        // Vendedor solo puede abrir caja en su tienda
        if ($user->isVendedor() && $validated['store_id'] != $user->store_id) {
            abort(403, 'Solo puedes abrir caja en tu tienda asignada.');
        }

        // Verificar si el usuario ya tiene una caja abierta (solo una por usuario)
        if ($user->hasOpenCashRegister()) {
            return back()->withErrors(['error' => 'Ya tienes una caja abierta.']);
        }

        // Se permite múltiples cajas abiertas por tienda (una por cada usuario)

        $cashRegister = CashRegister::create([
            'store_id' => $validated['store_id'],
            'opened_by' => auth()->id(),
            'opened_at' => now(),
            'opening_balance' => $validated['opening_balance'],
            'status' => 'abierta',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('sales.create')
            ->with('success', 'Caja abierta exitosamente. Ya puedes realizar ventas.');
    }

    public function show(CashRegister $cashRegister): Response
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();

        // Vendedor solo puede ver cajas que él abrió
        if ($user->isVendedor() && $cashRegister->opened_by !== $user->id) {
            abort(403, 'No tienes permiso para ver esta caja.');
        }

        $cashRegister->load([
            'store',
            'openedBy',
            'closedBy',
            'sales' => function ($query) {
                $query->with('user')->latest();
            },
            'sales.items.product',
            'cashMovements.user',
        ]);

        $totalSalesCash = $cashRegister->sales()
            ->where('status', 'completada')
            ->whereIn('payment_method', ['efectivo', 'mixto'])
            ->sum('total');

        $totalSalesCard = $cashRegister->sales()
            ->where('status', 'completada')
            ->where('payment_method', 'tarjeta')
            ->sum('total');

        $totalSalesTransfer = $cashRegister->sales()
            ->where('status', 'completada')
            ->where('payment_method', 'transferencia')
            ->sum('total');

        $totalDeposits = $cashRegister->cashMovements()
            ->where('type', 'deposito')
            ->sum('amount');

        $totalWithdrawals = $cashRegister->cashMovements()
            ->where('type', 'retiro')
            ->sum('amount');

        $expectedBalance = $cashRegister->opening_balance + $totalSalesCash + $totalDeposits - $totalWithdrawals;

        // Calcular datos financieros solo para admin
        $financialSummary = null;
        if ($isAdmin) {
            $financialSummary = $this->calculateCashRegisterFinancials($cashRegister);
        }

        return Inertia::render('cash-registers/show', [
            'cashRegister' => $cashRegister,
            'totalSalesCash' => (float) $totalSalesCash,
            'totalSalesCard' => (float) $totalSalesCard,
            'totalSalesTransfer' => (float) $totalSalesTransfer,
            'totalDeposits' => (float) $totalDeposits,
            'totalWithdrawals' => (float) $totalWithdrawals,
            'expectedBalance' => (float) $expectedBalance,
            'isAdmin' => $isAdmin,
            'canClose' => $isAdmin && $cashRegister->status === 'abierta',
            'canAddMovement' => $isAdmin && $cashRegister->status === 'abierta',
            'financialSummary' => $financialSummary,
        ]);
    }

    public function close(CashRegisterCloseRequest $request, CashRegister $cashRegister)
    {
        $user = auth()->user();

        // Solo admin puede cerrar cajas
        if (!$user->isAdmin()) {
            abort(403, 'Solo los administradores pueden cerrar cajas.');
        }

        if ($cashRegister->status === 'cerrada') {
            return back()->withErrors(['error' => 'Esta caja ya está cerrada.']);
        }

        $validated = $request->validated();

        // Calcular balance esperado
        $totalSalesCash = $cashRegister->sales()
            ->where('status', 'completada')
            ->whereIn('payment_method', ['efectivo', 'mixto'])
            ->sum('total');

        $totalDeposits = $cashRegister->cashMovements()
            ->where('type', 'deposito')
            ->sum('amount');

        $totalWithdrawals = $cashRegister->cashMovements()
            ->where('type', 'retiro')
            ->sum('amount');

        $expectedBalance = $cashRegister->opening_balance + $totalSalesCash + $totalDeposits - $totalWithdrawals;
        $difference = $validated['closing_balance'] - $expectedBalance;

        $cashRegister->update([
            'status' => 'cerrada',
            'closed_by' => auth()->id(),
            'closed_at' => now(),
            'closing_balance' => $validated['closing_balance'],
            'expected_balance' => $expectedBalance,
            'difference' => $difference,
            'notes' => $validated['notes'] ?? $cashRegister->notes,
        ]);

        return redirect()->route('cash-registers.show', $cashRegister)
            ->with('success', 'Caja cerrada exitosamente.');
    }

    public function addMovement(CashMovementRequest $request, CashRegister $cashRegister)
    {
        $user = auth()->user();

        // Solo admin puede agregar movimientos
        if (!$user->isAdmin()) {
            abort(403, 'Solo los administradores pueden agregar movimientos de caja.');
        }

        if ($cashRegister->status === 'cerrada') {
            return back()->withErrors(['error' => 'No se pueden agregar movimientos a una caja cerrada.']);
        }

        $validated = $request->validated();

        $cashRegister->cashMovements()->create([
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Movimiento registrado exitosamente.');
    }

    private function calculateCashRegisterFinancials(CashRegister $cashRegister): array
    {
        $sales = $cashRegister->sales()->where('status', 'completada')->with('items.product')->get();

        $totalRevenue = $sales->sum('total');
        $totalCost = 0;

        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $totalCost += $item->product->cost_price * $item->quantity;
            }
        }

        $totalProfit = $totalRevenue - $totalCost;
        $margin = $totalRevenue > 0 ? ($totalProfit / $totalRevenue) * 100 : 0;

        return [
            'total_sales_count' => $sales->count(),
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'total_profit' => round($totalProfit, 2),
            'margin_percent' => round($margin, 2),
        ];
    }
}
