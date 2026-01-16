import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Package, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Store {
    id: number;
    name: string;
    code: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Transfer {
    id: number;
    from_store: Store;
    to_store: Store;
    product: Product;
    quantity: number;
    notes: string | null;
    created_by: User;
    created_at: string;
}

interface StockTransfersIndexProps {
    transfers: {
        data: Transfer[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transferencias de Stock', href: '/stock-transfers' },
];

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function StockTransfersIndex({ transfers }: StockTransfersIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transferencias de Stock" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transferencias de Stock</h1>
                        <p className="text-sm text-muted-foreground">
                            Historial de movimientos de inventario entre tiendas
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/stock-transfers/create">
                            <Plus className="h-4 w-4" />
                            Nueva Transferencia
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Fecha
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Producto
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Movimiento
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Cantidad
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Notas
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Realizado por
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transfers.data.map((transfer) => (
                                    <tr key={transfer.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDate(transfer.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{transfer.product.name}</div>
                                            <code className="text-xs text-muted-foreground">
                                                {transfer.product.sku}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {transfer.from_store.name}
                                                </Badge>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <Badge variant="default">
                                                    {transfer.to_store.name}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Badge variant="secondary" className="font-mono">
                                                +{transfer.quantity}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                                            {transfer.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {transfer.created_by.name}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {transfers.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>No hay transferencias registradas</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/stock-transfers/create">Realizar primera transferencia</Link>
                            </Button>
                        </div>
                    )}

                    {transfers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {transfers.data.length} de {transfers.total} transferencias
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: transfers.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={
                                                page === transfers.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            asChild
                                        >
                                            <Link href={`/stock-transfers?page=${page}`}>
                                                {page}
                                            </Link>
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
