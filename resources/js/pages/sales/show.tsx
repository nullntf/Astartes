import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Ban,
    Calendar,
    CreditCard,
    DollarSign,
    Package,
    Percent,
    Receipt,
    Store,
    TrendingUp,
    User,
    Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
        cost_price: number;
        category: {
            id: number;
            name: string;
        };
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
    cancellation_reason: string | null;
    cancelled_at: string | null;
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
    cancelled_by: {
        id: number;
        name: string;
    } | null;
    items: SaleItem[];
}

interface FinancialItem {
    product_id: number;
    product_name: string;
    quantity: number;
    cost_price: number;
    sale_price: number;
    total_cost: number;
    total_sale: number;
    profit: number;
    margin_percent: number;
}

interface FinancialData {
    items: FinancialItem[];
    summary: {
        total_cost: number;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        total_profit: number;
        margin_percent: number;
    };
}

interface Props {
    sale: Sale;
    isAdmin: boolean;
    financialData: FinancialData | null;
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

const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia',
        mixto: 'Mixto',
    };
    return labels[method] || method;
};

export default function SaleShow({ sale, isAdmin, financialData }: Props) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        cancellation_reason: '',
    });

    const handleCancel = () => {
        post(`/sales/${sale.id}/cancel`, {
            onSuccess: () => setShowCancelModal(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Venta ${sale.sale_number}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/sales">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                <Receipt className="h-6 w-6" />
                                {sale.sale_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Detalles de la venta
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {sale.status === 'completada' ? (
                            <Badge variant="default" className="text-sm">
                                Completada
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="text-sm">
                                Anulada
                            </Badge>
                        )}
                        {isAdmin && sale.status === 'completada' && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowCancelModal(true)}
                            >
                                <Ban className="mr-2 h-4 w-4" />
                                Anular Venta
                            </Button>
                        )}
                    </div>
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
                                    <p className="font-medium">{sale.store.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vendedor</p>
                                    <p className="font-medium">{sale.user.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha</p>
                                    <p className="font-medium">{formatDate(sale.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                                    <Badge variant="outline">
                                        {getPaymentMethodLabel(sale.payment_method)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Caja</p>
                                    <p className="font-medium">#{sale.cash_register.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Totales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(sale.subtotal)}</span>
                            </div>
                            {sale.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Impuestos</span>
                                    <span>{formatCurrency(sale.tax)}</span>
                                </div>
                            )}
                            {sale.discount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Descuento</span>
                                    <span>-{formatCurrency(sale.discount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(sale.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Datos Financieros (solo admin) */}
                    {isAdmin && financialData && (
                        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    Análisis Financiero
                                </CardTitle>
                                <CardDescription>Solo visible para administradores</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Costo Total</span>
                                    <span>{formatCurrency(financialData.summary.total_cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ingreso Total</span>
                                    <span>{formatCurrency(financialData.summary.total)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-green-600">
                                    <span>Ganancia</span>
                                    <span>{formatCurrency(financialData.summary.total_profit)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Margen</span>
                                    <Badge variant="secondary" className="font-mono">
                                        <Percent className="mr-1 h-3 w-3" />
                                        {financialData.summary.margin_percent}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Información de Anulación */}
                {sale.status === 'anulada' && sale.cancelled_by && (
                    <Card className="border-destructive/50 bg-destructive/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-destructive">
                                <Ban className="h-4 w-4" />
                                Venta Anulada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Anulada por</p>
                                    <p className="font-medium">{sale.cancelled_by.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de anulación</p>
                                    <p className="font-medium">
                                        {sale.cancelled_at && formatDate(sale.cancelled_at)}
                                    </p>
                                </div>
                            </div>
                            {sale.cancellation_reason && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Razón</p>
                                    <p className="font-medium">{sale.cancellation_reason}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Productos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-4 w-4" />
                            Productos ({sale.items.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Unit.</TableHead>
                                    {isAdmin && financialData && (
                                        <>
                                            <TableHead className="text-right">Costo Unit.</TableHead>
                                            <TableHead className="text-right">Ganancia</TableHead>
                                            <TableHead className="text-right">Margen</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items.map((item) => {
                                    const financialItem = financialData?.items.find(
                                        (fi) => fi.product_id === item.product_id
                                    );

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.product.sku}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {item.product.category.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            {isAdmin && financialItem && (
                                                <>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatCurrency(financialItem.cost_price)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {formatCurrency(financialItem.profit)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant={
                                                                financialItem.margin_percent >= 20
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className="font-mono"
                                                        >
                                                            {financialItem.margin_percent}%
                                                        </Badge>
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell
                                        colSpan={isAdmin && financialData ? 8 : 4}
                                        className="text-right font-bold"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {formatCurrency(sale.total)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Anulación */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anular Venta</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de anular la venta {sale.sale_number}? El stock será
                            restaurado automáticamente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Razón de anulación *</Label>
                            <Textarea
                                id="reason"
                                value={data.cancellation_reason}
                                onChange={(e) => setData('cancellation_reason', e.target.value)}
                                placeholder="Describe el motivo de la anulación..."
                                rows={3}
                            />
                            {errors.cancellation_reason && (
                                <p className="text-sm text-destructive">
                                    {errors.cancellation_reason}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={processing || !data.cancellation_reason}
                        >
                            Confirmar Anulación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
