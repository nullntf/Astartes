<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with(['store'])
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->is_active);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15);

        $users->getCollection()->transform(function ($user) {
            $user->can_be_deleted = $user->canBeDeleted();
            $user->deletion_blockers = $user->getDeletionBlockers();
            return $user;
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only(['role', 'is_active', 'search']),
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }

    public function store(UserRequest $request)
    {
        $validated = $request->validated();

        User::create($validated);

        return redirect()->route('users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->load('store'),
            'stores' => Store::where('is_active', true)->get(),
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        // Prevenir que admin edite a otro admin
        if (auth()->user()->role === 'admin' && $user->role === 'admin' && $user->id !== auth()->id()) {
            return back()->withErrors(['error' => 'No puedes editar a otro administrador.']);
        }

        $validated = $request->validated();

        // Si no se proporciona password, no actualizarlo
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    public function destroy(User $user)
    {
        // No permitir eliminar al usuario autenticado
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propio usuario.']);
        }

        // Prevenir que admin elimine a otro admin
        if (auth()->user()->role === 'admin' && $user->role === 'admin') {
            return back()->withErrors(['error' => 'No puedes eliminar a otro administrador.']);
        }

        // Verificar si tiene relaciones que bloquean la eliminación
        if (!$user->canBeDeleted()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar este usuario: ' . implode(', ', $user->getDeletionBlockers())
            ]);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    public function toggleActive(User $user)
    {
        // No permitir desactivar al usuario autenticado
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes desactivar tu propio usuario.']);
        }

        // Prevenir que admin desactive a otro admin
        if (auth()->user()->role === 'admin' && $user->role === 'admin') {
            return back()->withErrors(['error' => 'No puedes desactivar a otro administrador.']);
        }

        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', 'Estado del usuario actualizado.');
    }
}
