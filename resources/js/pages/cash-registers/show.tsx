import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    DollarSign,
    Lock,
    Store,
    TrendingUp,
    User,
    Wallet,
    Receipt,
    Percent,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Sale {
    id: number;
    sale_number: string;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    items: Array<{
        id: number;
        quantity: number;
        product: {
            id: number;
            name: string;
        };
    }>;
}

interface CashMovement {
    id: number;
    type: string;
    amount: number;
    reason: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

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
    sales: Sale[];
    cash_movements: CashMovement[];
}

interface FinancialSummary {
    total_sales_count: number;
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    margin_percent: number;
}

interface Props {
    cashRegister: CashRegister;
    totalSalesCash: number;
    totalSalesCard: number;
    totalSalesTransfer: number;
    totalDeposits: number;
    totalWithdrawals: number;
    expectedBalance: number;
    isAdmin: boolean;
    canClose: boolean;
    canAddMovement: boolean;
    financialSummary: FinancialSummary | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
        dateStyle: 'long',
        timeStyle: 'short',
    });
};

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
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

export default function CashRegisterShow({
    cashRegister,
    totalSalesCash,
    totalSalesCard,
    totalSalesTransfer,
    totalDeposits,
    totalWithdrawals,
    expectedBalance,
    isAdmin,
    canClose,
    canAddMovement,
    financialSummary,
}: Props) {
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);

    const closeForm = useForm({
        closing_balance: '',
        notes: cashRegister.notes || '',
    });

    const movementForm = useForm({
        type: 'deposito' as 'deposito' | 'retiro',
        amount: '',
        reason: '',
    });

    const handleClose = () => {
        closeForm.post(`/cash-registers/${cashRegister.id}/close`, {
            onSuccess: () => setShowCloseModal(false),
        });
    };

    const handleAddMovement = () => {
        movementForm.post(`/cash-registers/${cashRegister.id}/movements`, {
            onSuccess: () => {
                setShowMovementModal(false);
                movementForm.reset();
            },
        });
    };

    const totalSales = totalSalesCash + totalSalesCard + totalSalesTransfer;
    const completedSales = cashRegister.sales.filter((s) => s.status === 'completada');

    return (
        <AppLayout>
            <Head title={`Caja #${cashRegister.id}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/cash-registers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                <Wallet className="h-6 w-6" />
                                Caja #{cashRegister.id}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {cashRegister.store.name} - {cashRegister.store.code}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {cashRegister.status === 'abierta' ? (
                            <Badge variant="default" className="bg-green-600 text-sm">
                                <Clock className="mr-1 h-3 w-3" />
                                Abierta
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-sm">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Cerrada
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                Saldo Inicial
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(cashRegister.opening_balance)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Banknote className="h-4 w-4" />
                                Ventas Efectivo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                +{formatCurrency(totalSalesCash)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                Depósitos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                +{formatCurrency(totalDeposits)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <ArrowUpCircle className="h-4 w-4 text-destructive" />
                                Retiros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-destructive">
                                -{formatCurrency(totalWithdrawals)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tienda</p>
                                    <p className="font-medium">{cashRegister.store.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Abierta por</p>
                                    <p className="font-medium">{cashRegister.opened_by.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha Apertura</p>
                                    <p className="font-medium">{formatDate(cashRegister.opened_at)}</p>
                                </div>
                            </div>
                            {cashRegister.closed_by && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Cerrada por</p>
                                            <p className="font-medium">{cashRegister.closed_by.name}</p>
                                        </div>
                                    </div>
                                    {cashRegister.closed_at && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Fecha Cierre</p>
                                                <p className="font-medium">
                                                    {formatDate(cashRegister.closed_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen de Ventas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resumen de Ventas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Receipt className="h-4 w-4" />
                                    Total Ventas
                                </span>
                                <span className="font-medium">{completedSales.length}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Banknote className="h-4 w-4" />
                                    Efectivo
                                </span>
                                <span>{formatCurrency(totalSalesCash)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Tarjeta
                                </span>
                                <span>{formatCurrency(totalSalesCard)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    Transferencia
                                </span>
                                <span>{formatCurrency(totalSalesTransfer)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <span>Total Ingresos</span>
                                <span className="text-primary">{formatCurrency(totalSales)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance / Cuadre */}
                    <Card className={cashRegister.status === 'abierta' ? 'border-green-500' : ''}>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {cashRegister.status === 'abierta'
                                    ? 'Balance Esperado'
                                    : 'Cuadre de Caja'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Saldo Inicial</span>
                                <span>{formatCurrency(cashRegister.opening_balance)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>+ Ventas Efectivo</span>
                                <span>{formatCurrency(totalSalesCash)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>+ Depósitos</span>
                                <span>{formatCurrency(totalDeposits)}</span>
                            </div>
                            <div className="flex justify-between text-destructive">
                                <span>- Retiros</span>
                                <span>{formatCurrency(totalWithdrawals)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Balance Esperado</span>
                                <span className="text-primary">{formatCurrency(expectedBalance)}</span>
                            </div>

                            {cashRegister.status === 'cerrada' && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Balance Real</span>
                                        <span className="font-medium">
                                            {formatCurrency(cashRegister.closing_balance || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Diferencia</span>
                                        <span
                                            className={
                                                (cashRegister.difference || 0) >= 0
                                                    ? 'text-green-600'
                                                    : 'text-destructive'
                                            }
                                        >
                                            {(cashRegister.difference || 0) >= 0 ? '+' : ''}
                                            {formatCurrency(cashRegister.difference || 0)}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Botones de Acción (solo admin) */}
                            {isAdmin && cashRegister.status === 'abierta' && (
                                <div className="space-y-2 pt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => setShowCloseModal(true)}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Cerrar Caja
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowMovementModal(true)}
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Agregar Movimiento
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Análisis Financiero (solo admin) */}
                {isAdmin && financialSummary && (
                    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Análisis Financiero
                            </CardTitle>
                            <CardDescription>Solo visible para administradores</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Ventas</p>
                                    <p className="text-2xl font-bold">
                                        {financialSummary.total_sales_count}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Ingresos</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(financialSummary.total_revenue)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Costo</p>
                                    <p className="text-2xl font-bold text-muted-foreground">
                                        {formatCurrency(financialSummary.total_cost)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Ganancia</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(financialSummary.total_profit)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Margen</p>
                                    <Badge
                                        variant={
                                            financialSummary.margin_percent >= 20
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="text-lg font-bold"
                                    >
                                        <Percent className="mr-1 h-4 w-4" />
                                        {financialSummary.margin_percent}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Movimientos de Caja */}
                {cashRegister.cash_movements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4" />
                                Movimientos de Caja ({cashRegister.cash_movements.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Razón</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cashRegister.cash_movements.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <TableCell>
                                                {formatTime(movement.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {movement.type === 'deposito' ? (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-600"
                                                    >
                                                        <ArrowDownCircle className="mr-1 h-3 w-3" />
                                                        Depósito
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                                                        Retiro
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{movement.user.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {movement.reason}
                                            </TableCell>
                                            <TableCell
                                                className={`text-right font-medium ${
                                                    movement.type === 'deposito'
                                                        ? 'text-green-600'
                                                        : 'text-destructive'
                                                }`}
                                            >
                                                {movement.type === 'deposito' ? '+' : '-'}
                                                {formatCurrency(movement.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Ventas del Día */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Receipt className="h-4 w-4" />
                            Ventas ({cashRegister.sales.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Venta</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashRegister.sales.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No hay ventas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cashRegister.sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/sales/${sale.id}`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {sale.sale_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {formatTime(sale.created_at)}
                                            </TableCell>
                                            <TableCell>{sale.user.name}</TableCell>
                                            <TableCell>
                                                {sale.items.reduce((sum, i) => sum + i.quantity, 0)}{' '}
                                                producto(s)
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getPaymentMethodLabel(sale.payment_method)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(sale.total)}
                                            </TableCell>
                                            <TableCell>
                                                {sale.status === 'completada' ? (
                                                    <Badge variant="default">Completada</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Anulada</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Cierre */}
            <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cerrar Caja</DialogTitle>
                        <DialogDescription>
                            Ingresa el saldo final de la caja para realizar el cierre.
                            Balance esperado: {formatCurrency(expectedBalance)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="closing_balance">Saldo de Cierre *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="closing_balance"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={closeForm.data.closing_balance}
                                    onChange={(e) =>
                                        closeForm.setData('closing_balance', e.target.value)
                                    }
                                    className="pl-7"
                                    placeholder="0.00"
                                />
                            </div>
                            {closeForm.errors.closing_balance && (
                                <p className="text-sm text-destructive">
                                    {closeForm.errors.closing_balance}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas (opcional)</Label>
                            <Textarea
                                id="notes"
                                value={closeForm.data.notes}
                                onChange={(e) => closeForm.setData('notes', e.target.value)}
                                placeholder="Observaciones del cierre..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleClose}
                            disabled={closeForm.processing || !closeForm.data.closing_balance}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Cerrar Caja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Movimiento */}
            <Dialog open={showMovementModal} onOpenChange={setShowMovementModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Movimiento</DialogTitle>
                        <DialogDescription>
                            Registra un depósito o retiro de efectivo en la caja.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tipo de Movimiento *</Label>
                            <Select
                                value={movementForm.data.type}
                                onValueChange={(value: 'deposito' | 'retiro') =>
                                    movementForm.setData('type', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deposito">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                            Depósito
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="retiro">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpCircle className="h-4 w-4 text-destructive" />
                                            Retiro
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={movementForm.data.amount}
                                    onChange={(e) =>
                                        movementForm.setData('amount', e.target.value)
                                    }
                                    className="pl-7"
                                    placeholder="0.00"
                                />
                            </div>
                            {movementForm.errors.amount && (
                                <p className="text-sm text-destructive">
                                    {movementForm.errors.amount}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Razón *</Label>
                            <Textarea
                                id="reason"
                                value={movementForm.data.reason}
                                onChange={(e) => movementForm.setData('reason', e.target.value)}
                                placeholder="Describe el motivo del movimiento..."
                                rows={3}
                            />
                            {movementForm.errors.reason && (
                                <p className="text-sm text-destructive">
                                    {movementForm.errors.reason}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMovementModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddMovement}
                            disabled={
                                movementForm.processing ||
                                !movementForm.data.amount ||
                                !movementForm.data.reason
                            }
                        >
                            Registrar Movimiento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
