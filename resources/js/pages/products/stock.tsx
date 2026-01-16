import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save, Store } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface StoreData {
    id: number;
    name: string;
    code: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    stores: {
        id: number;
        name: string;
        code: string;
        pivot: {
            stock: number;
            min_stock: number;
        };
    }[];
}

interface StockManagementProps {
    products: Product[];
    stores: StoreData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
    { title: 'Gestión de Stock', href: '/products/stock' },
];

export default function StockManagement({ products, stores }: StockManagementProps) {
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<string>('');

    const { data, setData, post, processing, reset } = useForm({
        store_id: '',
        stock: '0',
        min_stock: '0',
    });

    const currentProduct = products.find((p) => String(p.id) === selectedProduct);

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        post(`/products/${selectedProduct}/assign-store`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('stock', 'min_stock');
            },
        });
    };

    const getStoreStock = (product: Product, storeId: number) => {
        const store = product.stores.find((s) => s.id === storeId);
        return store?.pivot;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Stock" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href="/products">
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Productos
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Stock</h1>
                    <p className="text-sm text-muted-foreground">
                        Asigna y gestiona el stock de productos por tienda
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Asignar Stock
                            </CardTitle>
                            <CardDescription>
                                Asigna un producto a una tienda con su cantidad de stock
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAssign} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Producto</Label>
                                    <Select
                                        value={selectedProduct}
                                        onValueChange={(value) => {
                                            setSelectedProduct(value);
                                            setData('store_id', '');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={String(product.id)}>
                                                    {product.sku} - {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tienda</Label>
                                    <Select
                                        value={data.store_id}
                                        onValueChange={(value) => {
                                            setData('store_id', value);
                                            if (currentProduct) {
                                                const existing = getStoreStock(currentProduct, Number(value));
                                                if (existing) {
                                                    setData('stock', String(existing.stock));
                                                    setData('min_stock', String(existing.min_stock));
                                                } else {
                                                    setData('stock', '0');
                                                    setData('min_stock', '0');
                                                }
                                            }
                                        }}
                                        disabled={!selectedProduct}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tienda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores.map((store) => {
                                                const hasStock = currentProduct?.stores.some(
                                                    (s) => s.id === store.id
                                                );
                                                return (
                                                    <SelectItem key={store.id} value={String(store.id)}>
                                                        {store.name} ({store.code})
                                                        {hasStock && ' ✓'}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            disabled={!data.store_id}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="min_stock">Stock Mínimo</Label>
                                        <Input
                                            id="min_stock"
                                            type="number"
                                            min="0"
                                            value={data.min_stock}
                                            onChange={(e) => setData('min_stock', e.target.value)}
                                            disabled={!data.store_id}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || !selectedProduct || !data.store_id}
                                    className="w-full"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Guardar Asignación'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Stock Actual del Producto
                            </CardTitle>
                            <CardDescription>
                                {currentProduct
                                    ? `${currentProduct.name} (${currentProduct.sku})`
                                    : 'Selecciona un producto para ver su stock'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {currentProduct ? (
                                currentProduct.stores.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentProduct.stores.map((store) => {
                                            const isLow = store.pivot.stock <= store.pivot.min_stock;
                                            return (
                                                <div
                                                    key={store.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div>
                                                        <div className="font-medium">{store.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {store.code}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-medium ${isLow ? 'text-orange-600' : ''}`}>
                                                            {store.pivot.stock} unidades
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Mín: {store.pivot.min_stock}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        Este producto no está asignado a ninguna tienda
                                    </div>
                                )
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>Selecciona un producto para ver su distribución de stock</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Stock por Tienda</CardTitle>
                        <CardDescription>
                            Vista general de productos asignados a cada tienda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">
                                                Tienda
                                            </th>
                                            {products.slice(0, 8).map((product) => (
                                                <th
                                                    key={product.id}
                                                    className="px-4 py-3 text-center text-sm font-medium"
                                                    title={product.name}
                                                >
                                                    {product.sku}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {stores.map((store) => (
                                            <tr key={store.id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 font-medium">
                                                    {store.name}
                                                    <div className="text-sm text-muted-foreground">
                                                        {store.code}
                                                    </div>
                                                </td>
                                                {products.slice(0, 8).map((product) => {
                                                    const stock = getStoreStock(product, store.id);
                                                    const isLow = stock && stock.stock <= stock.min_stock;
                                                    return (
                                                        <td
                                                            key={product.id}
                                                            className="px-4 py-3 text-center"
                                                        >
                                                            {stock ? (
                                                                <Badge
                                                                    variant={isLow ? 'outline' : 'secondary'}
                                                                    className={isLow ? 'text-orange-600 border-orange-600' : ''}
                                                                >
                                                                    {stock.stock}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {products.length > 8 && (
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Mostrando 8 de {products.length} productos
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
