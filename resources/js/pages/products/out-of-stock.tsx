import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Package, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

interface Product {
    id: number;
    sku: string;
    name: string;
    sale_price: number;
    is_active: boolean;
    category: { id: number; name: string };
    stores_out_of_stock: Array<{
        id: number;
        name: string;
        code: string;
        min_stock: number;
    }>;
}

interface OutOfStockProps {
    products: Product[];
    stores: Store[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
    { title: 'Sin Stock', href: '/products/out-of-stock' },
];

export default function OutOfStock({ products, stores }: OutOfStockProps) {
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [storeId, setStoreId] = useState('');
    const [stock, setStock] = useState('');
    const [minStock, setMinStock] = useState('0');

    const openAssignDialog = (product: Product) => {
        setSelectedProduct(product);
        setStoreId('');
        setStock('');
        setMinStock('0');
        setAssignDialogOpen(true);
    };

    const handleAssignStock = () => {
        if (!selectedProduct || !storeId || !stock) return;

        router.post(`/products/${selectedProduct.id}/assign-store`, {
            store_id: parseInt(storeId),
            stock: parseInt(stock),
            min_stock: parseInt(minStock),
        }, {
            onSuccess: () => {
                setAssignDialogOpen(false);
                setSelectedProduct(null);
            },
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos Sin Stock" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                                Productos Sin Stock por Tienda
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {products.length} producto(s) con stock cero en al menos una tienda
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.reload()}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    {products.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex flex-col rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{product.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Categoría:</span>
                                            <span>{product.category.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Precio venta:</span>
                                            <span className="font-medium">{formatCurrency(product.sale_price)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tiendas sin stock:</span>
                                            <span className="font-bold text-red-500">
                                                {product.stores_out_of_stock.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-1 border-t pt-3">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Tiendas afectadas:
                                        </div>
                                        {product.stores_out_of_stock.map((store) => (
                                            <div
                                                key={store.id}
                                                className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {store.code}
                                                    </Badge>
                                                    <span>{store.name}</span>
                                                </div>
                                                {store.min_stock > 0 && (
                                                    <span className="text-muted-foreground">
                                                        Min: {store.min_stock}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openAssignDialog(product)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Asignar Stock
                                        </Button>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/products/${product.id}`}>
                                                Ver Detalles
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                <Package className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium">¡Excelente!</h3>
                            <p className="text-muted-foreground">
                                Todos los productos tienen stock disponible
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asignar Stock</DialogTitle>
                        <DialogDescription>
                            Asigna stock del producto "{selectedProduct?.name}" a una tienda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="store">Tienda</Label>
                            <Select value={storeId} onValueChange={setStoreId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una tienda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map((store) => (
                                        <SelectItem key={store.id} value={store.id.toString()}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Cantidad</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="1"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="Cantidad a asignar"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_stock">Stock Mínimo</Label>
                            <Input
                                id="min_stock"
                                type="number"
                                min="0"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                placeholder="Stock mínimo de alerta"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAssignStock} disabled={!storeId || !stock}>
                            Asignar Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
