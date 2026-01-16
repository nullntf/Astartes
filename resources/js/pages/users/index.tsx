import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'bodega' | 'vendedor';
    store_id: number | null;
    store?: { id: number; name: string };
    is_active: boolean;
    can_be_deleted: boolean;
    deletion_blockers: string[];
    created_at: string;
}

interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        role?: string;
        is_active?: string;
        search?: string;
    };
    auth: {
        user: User;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/users' },
];

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    bodega: 'Bodega',
    vendedor: 'Vendedor',
};

const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    bodega: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    vendedor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function UsersIndex({ users, filters, auth }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/users',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const toggleActive = (userId: number) => {
        router.post(`/users/${userId}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const deleteUser = (userId: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            router.delete(`/users/${userId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona los usuarios del sistema
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/users/create">
                            <Plus className="h-4 w-4" />
                            Nuevo Usuario
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <Input
                                placeholder="Buscar por nombre, email o username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" variant="secondary">
                                <Search className="h-4 w-4" />
                                Buscar
                            </Button>
                        </form>

                        <Select
                            value={filters.role || 'all'}
                            onValueChange={(value) =>
                                handleFilter('role', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="bodega">Bodega</SelectItem>
                                <SelectItem value="vendedor">Vendedor</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                handleFilter('is_active', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="1">Activos</SelectItem>
                                <SelectItem value="0">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Usuario
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Rol
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Tienda
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge className={roleColors[user.role]}>
                                                    {roleLabels[user.role]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {user.store?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={user.is_active ? 'default' : 'secondary'}
                                                >
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {/* No mostrar acciones si es el usuario autenticado o si es admin y el usuario objetivo también es admin */}
                                                    {user.id !== auth.user.id && !(auth.user.role === 'admin' && user.role === 'admin') && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => toggleActive(user.id)}
                                                                title={
                                                                    user.is_active
                                                                        ? 'Desactivar'
                                                                        : 'Activar'
                                                                }
                                                            >
                                                                {user.is_active ? (
                                                                    <UserX className="h-4 w-4" />
                                                                ) : (
                                                                    <UserCheck className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button size="sm" variant="ghost" asChild>
                                                                <Link href={`/users/${user.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            {user.can_be_deleted ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => deleteUser(user.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled
                                                                    title={user.deletion_blockers.join(', ')}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {user.id === auth.user.id && (
                                                        <span className="text-xs text-muted-foreground">Tú</span>
                                                    )}
                                                    {user.id !== auth.user.id && auth.user.role === 'admin' && user.role === 'admin' && (
                                                        <span className="text-xs text-muted-foreground">Protegido</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {users.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron usuarios
                        </div>
                    )}

                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {users.data.length} de {users.total} usuarios
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: users.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={
                                                page === users.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                router.get(`/users?page=${page}`, filters, {
                                                    preserveState: true,
                                                })
                                            }
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
