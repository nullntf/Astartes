import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, MapPin, Package, Phone, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    pivot: {
        stock: number;
        min_stock: number;
    };
}

interface User {
    id: number;
    name: string;
    username: string;
    role: string;
}

interface CashRegister {
    id: number;
    status: 'abierta' | 'cerrada';
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
}

interface Store {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    products: Product[];
    users: User[];
    cash_registers: CashRegister[];
    created_at: string;
}

interface ShowStoreProps {
    store: Store;
}

export default function ShowStore({ store }: ShowStoreProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tiendas', href: '/stores' },
        { title: store.name, href: `/stores/${store.id}` },
    ];

    const lowStockProducts = store.products.filter(
        (p) => p.pivot.stock <= p.pivot.min_stock
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={store.name} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href="/stores">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
                            <Badge variant={store.is_active ? 'default' : 'secondary'}>
                                {store.is_active ? 'Activa' : 'Inactiva'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Código: <code className="rounded bg-muted px-2 py-0.5">{store.code}</code>
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`/stores/${store.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="h-4 w-4" />
                                Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{store.products.length}</div>
                            <p className="text-sm text-muted-foreground">
                                {lowStockProducts.length > 0 && (
                                    <span className="text-orange-600">
                                        {lowStockProducts.length} con stock bajo
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" />
                                Usuarios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{store.users.length}</div>
                            <p className="text-sm text-muted-foreground">asignados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {store.address && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <span>{store.address}</span>
                                </div>
                            )}
                            {store.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{store.phone}</span>
                                </div>
                            )}
                            {!store.address && !store.phone && (
                                <p className="text-sm text-muted-foreground">Sin información de contacto</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Asignados</CardTitle>
                            <CardDescription>
                                Stock de productos en esta tienda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {store.products.length > 0 ? (
                                <div className="space-y-2">
                                    {store.products.slice(0, 10).map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    SKU: {product.sku}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-medium ${
                                                    product.pivot.stock <= product.pivot.min_stock
                                                        ? 'text-orange-600'
                                                        : ''
                                                }`}>
                                                    {product.pivot.stock} unidades
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Mín: {product.pivot.min_stock}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {store.products.length > 10 && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            +{store.products.length - 10} productos más
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    No hay productos asignados a esta tienda
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usuarios Asignados</CardTitle>
                            <CardDescription>
                                Personal que trabaja en esta tienda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {store.users.length > 0 ? (
                                <div className="space-y-2">
                                    {store.users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    @{user.username}
                                                </div>
                                            </div>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-muted-foreground">
                                    No hay usuarios asignados a esta tienda
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
