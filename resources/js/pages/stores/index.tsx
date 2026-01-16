import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, MapPin, Phone, Plus, Search, Trash2 } from 'lucide-react';
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

interface Store {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    can_be_deleted: boolean;
    deletion_blockers: string[];
    created_by: { id: number; name: string } | null;
    created_at: string;
}

interface StoresIndexProps {
    stores: {
        data: Store[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        is_active?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tiendas', href: '/stores' },
];

export default function StoresIndex({ stores, filters = {} }: StoresIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/stores',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const toggleActive = (storeId: number) => {
        router.patch(`/stores/${storeId}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const deleteStore = (storeId: number) => {
        if (confirm('¿Estás seguro de eliminar esta tienda? Esta acción no se puede deshacer.')) {
            router.delete(`/stores/${storeId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiendas" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tiendas</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las sucursales del negocio
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/stores/create">
                            <Plus className="h-4 w-4" />
                            Nueva Tienda
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <Input
                                placeholder="Buscar por nombre o código..."
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
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                handleFilter('is_active', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="1">Activas</SelectItem>
                                <SelectItem value="0">Inactivas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Tienda
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Código
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Contacto
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
                                    {stores.data.map((store) => (
                                        <tr key={store.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{store.name}</div>
                                                    {store.address && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            {store.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-2 py-1 text-sm">
                                                    {store.code}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {store.phone ? (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {store.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={store.is_active ? 'default' : 'secondary'}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleActive(store.id)}
                                                >
                                                    {store.is_active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/stores/${store.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/stores/${store.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {store.can_be_deleted ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteStore(store.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled
                                                            title={store.deletion_blockers.join(', ')}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {stores.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron tiendas
                        </div>
                    )}

                    {stores.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {stores.data.length} de {stores.total} tiendas
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: stores.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={
                                                page === stores.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                router.get(`/stores?page=${page}`, filters, {
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
