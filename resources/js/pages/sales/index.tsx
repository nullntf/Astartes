import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Filter,
    Plus,
    ShoppingCart,
    Store,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SaleItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: {
        id: number;
        name: string;
        sku: string;
    };
}

interface Sale {
    id: number;
    sale_number: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
    store: {
        id: number;
        name: string;
        code: string;
    };
    user: {
        id: number;
        name: string;
    };
    cash_register: {
        id: number;
    };
    items: SaleItem[];
}

interface StoreOption {
    id: number;
    name: string;
    code: string;
}

interface PaginatedSales {
    data: Sale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    store_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    sales: PaginatedSales;
    stores: StoreOption[];
    filters: Filters;
    isAdmin: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia',
        mixto: 'Mixto',
    };
    return labels[method] || method;
};

const getStatusBadge = (status: string) => {
    if (status === 'completada') {
        return <Badge variant="default">Completada</Badge>;
    }
    return <Badge variant="destructive">Anulada</Badge>;
};

export default function SalesIndex({ sales, stores, filters, isAdmin }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/sales',
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        router.get('/sales');
    };

    return (
        <AppLayout>
            <Head title="Historial de Ventas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ShoppingCart className="h-6 w-6" />
                            Historial de Ventas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isAdmin ? 'Todas las ventas del sistema' : 'Tus ventas registradas'}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/sales/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Link>
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {isAdmin && stores.length > 0 && (
                                <div className="w-48">
                                    <Select
                                        value={filters.store_id || ''}
                                        onValueChange={(value) =>
                                            handleFilterChange('store_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas las tiendas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las tiendas</SelectItem>
                                            {stores.map((store) => (
                                                <SelectItem
                                                    key={store.id}
                                                    value={store.id.toString()}
                                                >
                                                    {store.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="w-40">
                                <Select
                                    value={filters.status || ''}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="completada">Completada</SelectItem>
                                        <SelectItem value="anulada">Anulada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) =>
                                        handleFilterChange('date_from', e.target.value)
                                    }
                                    className="w-40"
                                />
                                <span className="text-muted-foreground">a</span>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) =>
                                        handleFilterChange('date_to', e.target.value)
                                    }
                                    className="w-40"
                                />
                            </div>

                            {(filters.store_id || filters.status || filters.date_from || filters.date_to) && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de Ventas */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Venta</TableHead>
                                    {isAdmin && <TableHead>Tienda</TableHead>}
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Método Pago</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 8 : 7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            <ShoppingCart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No se encontraron ventas</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sales.data.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">
                                                {sale.sale_number}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-muted-foreground" />
                                                        <span>{sale.store.name}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell>{sale.user.name}</TableCell>
                                            <TableCell>{formatDate(sale.created_at)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getPaymentMethodLabel(sale.payment_method)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(sale.total)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(sale.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/sales/${sale.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginación */}
                {sales.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {sales.data.length} de {sales.total} ventas
                        </p>
                        <div className="flex gap-2">
                            {sales.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
