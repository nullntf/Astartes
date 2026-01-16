import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Store } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface StoreStock {
    id: number;
    name: string;
    code: string;
    pivot: {
        stock: number;
        min_stock: number;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    cost_price: number;
    sale_price: number;
    is_active: boolean;
    category: Category;
    stores: StoreStock[];
    created_at: string;
}

interface ShowProductProps {
    product: Product;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value);
}

export default function ShowProduct({ product }: ShowProductProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}` },
    ];

    const totalStock = product.stores.reduce((acc, store) => acc + store.pivot.stock, 0);
    const margin = ((product.sale_price - product.cost_price) / product.cost_price) * 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            SKU: <code className="rounded bg-muted px-2 py-0.5">{product.sku}</code>
                            {' · '}
                            Categoría: {product.category.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/products/stock">
                                <Package className="h-4 w-4" />
                                Gestionar Stock
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {product.description && (
                    <p className="max-w-2xl text-muted-foreground">{product.description}</p>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Precio de Costo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(product.cost_price)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Precio de Venta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(product.sale_price)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Margen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {margin.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="h-4 w-4" />
                                Stock Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStock}</div>
                            <p className="text-sm text-muted-foreground">
                                en {product.stores.length} tiendas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            Stock por Tienda
                        </CardTitle>
                        <CardDescription>
                            Distribución del inventario en las diferentes sucursales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {product.stores.length > 0 ? (
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">
                                                Tienda
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">
                                                Código
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                Stock Actual
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                Stock Mínimo
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {product.stores.map((store) => {
                                            const isLowStock = store.pivot.stock <= store.pivot.min_stock;
                                            return (
                                                <tr key={store.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">
                                                        {store.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <code className="rounded bg-muted px-2 py-1 text-sm">
                                                            {store.code}
                                                        </code>
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${isLowStock ? 'text-orange-600' : ''}`}>
                                                        {store.pivot.stock}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {store.pivot.min_stock}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {isLowStock ? (
                                                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                                Stock Bajo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                                OK
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                <p>Este producto no está asignado a ninguna tienda</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href="/products/stock">Asignar a tiendas</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
