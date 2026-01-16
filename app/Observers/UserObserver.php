<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Validation\ValidationException;

class UserObserver
{
    public function creating(User $user): void
    {
        $this->validateVendedorStoreAssignment($user);
        $this->clearStoreIdForNonVendedor($user);
    }

    public function updating(User $user): void
    {
        $this->validateVendedorStoreAssignment($user);
        $this->clearStoreIdForNonVendedor($user);
    }

    private function validateVendedorStoreAssignment(User $user): void
    {
        if ($user->role === 'vendedor' && is_null($user->store_id)) {
            throw ValidationException::withMessages([
                'store_id' => ['Un vendedor debe tener una tienda asignada'],
            ]);
        }
    }

    private function clearStoreIdForNonVendedor(User $user): void
    {
        if ($user->role !== 'vendedor' && ! is_null($user->store_id)) {
            $user->store_id = null;
        }
    }
}
