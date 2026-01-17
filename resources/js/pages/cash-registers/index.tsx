import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Filter,
    Plus,
    Store,
    Wallet,
    XCircle,
    CheckCircle,
    Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface CashRegister {
    id: number;
    store_id: number;
    opened_at: string;
    opening_balance: number;
    closed_at: string | null;
    closing_balance: number | null;
    expected_balance: number | null;
    difference: number | null;
    status: string;
    notes: string | null;
    store: {
        id: number;
        name: string;
        code: string;
    };
    opened_by: {
        id: number;
        name: string;
    };
    closed_by: {
        id: number;
        name: string;
    } | null;
}

interface StoreOption {
    id: number;
    name: string;
    code: string;
}

interface PaginatedCashRegisters {
    data: CashRegister[];
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
}

interface Props {
    cashRegisters: PaginatedCashRegisters;
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

export default function CashRegistersIndex({
    cashRegisters,
    stores,
    filters,
    isAdmin,
}: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/cash-registers',
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        router.get('/cash-registers');
    };

    return (
        <AppLayout>
            <Head title="Cajas Registradoras" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Wallet className="h-6 w-6" />
                            Cajas Registradoras
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isAdmin ? 'Gestión de todas las cajas' : 'Tus cajas registradoras'}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/cash-registers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Abrir Caja
                        </Link>
                    </Button>
                </div>

                {/* Filtros */}
                {isAdmin && stores.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
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
                                            <SelectItem value="abierta">Abierta</SelectItem>
                                            <SelectItem value="cerrada">Cerrada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(filters.store_id || filters.status) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de Cajas */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    {isAdmin && <TableHead>Tienda</TableHead>}
                                    <TableHead>Abierta por</TableHead>
                                    <TableHead>Fecha Apertura</TableHead>
                                    <TableHead className="text-right">Saldo Inicial</TableHead>
                                    <TableHead className="text-right">Saldo Cierre</TableHead>
                                    <TableHead className="text-right">Diferencia</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashRegisters.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={isAdmin ? 9 : 8}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            <Wallet className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No se encontraron cajas</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cashRegisters.data.map((register) => (
                                        <TableRow key={register.id}>
                                            <TableCell className="font-medium">
                                                #{register.id}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="h-4 w-4 text-muted-foreground" />
                                                        <span>{register.store.name}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell>{register.opened_by?.name}</TableCell>
                                            <TableCell>
                                                {formatDate(register.opened_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(register.opening_balance)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {register.closing_balance !== null
                                                    ? formatCurrency(register.closing_balance)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {register.difference !== null ? (
                                                    <span
                                                        className={
                                                            register.difference >= 0
                                                                ? 'text-green-600'
                                                                : 'text-destructive'
                                                        }
                                                    >
                                                        {register.difference >= 0 ? '+' : ''}
                                                        {formatCurrency(register.difference)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {register.status === 'abierta' ? (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-600"
                                                    >
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        Abierta
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Cerrada
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cash-registers/${register.id}`}>
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
                {cashRegisters.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {cashRegisters.data.length} de {cashRegisters.total} cajas
                        </p>
                        <div className="flex gap-2">
                            {cashRegisters.links.map((link, index) => (
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
