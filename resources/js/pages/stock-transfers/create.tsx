import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Store {
    id: number;
    name: string;
    code: string;
}

interface ProductStore {
    id: number;
    name: string;
    code: string;
    pivot: {
        stock: number;
        min_stock: number;
    };
}

interface Product {
    id: number;
    sku: string;
    name: string;
    stores: ProductStore[];
}

interface CreateTransferProps {
    stores: Store[];
    products: Product[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transferencias', href: '/stock-transfers' },
    { title: 'Nueva Transferencia', href: '/stock-transfers/create' },
];

export default function CreateTransfer({ stores, products }: CreateTransferProps) {
    const [availableStock, setAvailableStock] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        from_store_id: '',
        to_store_id: '',
        product_id: '',
        quantity: '',
        notes: '',
    });

    // Actualizar stock disponible cuando cambia producto o tienda origen
    useEffect(() => {
        if (data.product_id && data.from_store_id) {
            const product = products.find((p) => String(p.id) === data.product_id);
            if (product) {
                const storeProduct = product.stores.find(
                    (s) => String(s.id) === data.from_store_id
                );
                setAvailableStock(storeProduct?.pivot.stock || 0);
            }
        } else {
            setAvailableStock(0);
        }
    }, [data.product_id, data.from_store_id, products]);

    // Actualizar producto seleccionado
    useEffect(() => {
        const product = products.find((p) => String(p.id) === data.product_id);
        setSelectedProduct(product || null);
    }, [data.product_id, products]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock-transfers');
    };

    // Tiendas disponibles como destino (todas excepto la de origen)
    const availableDestinations = stores.filter(
        (store) => String(store.id) !== data.from_store_id
    );

    // Tiendas que tienen el producto seleccionado (para origen)
    const storesWithProduct = selectedProduct
        ? stores.filter((store) =>
              selectedProduct.stores.some((s) => s.id === store.id && s.pivot.stock > 0)
          )
        : stores;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Transferencia" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href="/stock-transfers">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Nueva Transferencia</h1>
                    <p className="text-sm text-muted-foreground">
                        Transfiere stock de un producto entre tiendas
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de la Transferencia</CardTitle>
                            <CardDescription>
                                Selecciona el producto y las tiendas involucradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        Producto <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.product_id}
                                        onValueChange={(value) => {
                                            setData('product_id', value);
                                            setData('from_store_id', '');
                                            setData('to_store_id', '');
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
                                    {errors.product_id && (
                                        <p className="text-sm text-destructive">{errors.product_id}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>
                                            Tienda Origen <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.from_store_id}
                                            onValueChange={(value) => {
                                                setData('from_store_id', value);
                                                if (data.to_store_id === value) {
                                                    setData('to_store_id', '');
                                                }
                                            }}
                                            disabled={!data.product_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar origen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {storesWithProduct.map((store) => {
                                                    const stock = selectedProduct?.stores.find(
                                                        (s) => s.id === store.id
                                                    )?.pivot.stock;
                                                    return (
                                                        <SelectItem key={store.id} value={String(store.id)}>
                                                            {store.name} ({store.code})
                                                            {stock !== undefined && ` - ${stock} uds`}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {errors.from_store_id && (
                                            <p className="text-sm text-destructive">{errors.from_store_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Tienda Destino <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.to_store_id}
                                            onValueChange={(value) => setData('to_store_id', value)}
                                            disabled={!data.from_store_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar destino" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableDestinations.map((store) => (
                                                    <SelectItem key={store.id} value={String(store.id)}>
                                                        {store.name} ({store.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.to_store_id && (
                                            <p className="text-sm text-destructive">{errors.to_store_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Cantidad <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max={availableStock}
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            placeholder="0"
                                            disabled={!data.from_store_id}
                                        />
                                        {availableStock > 0 && (
                                            <Badge variant="outline">
                                                Disponible: {availableStock}
                                            </Badge>
                                        )}
                                    </div>
                                    {errors.quantity && (
                                        <p className="text-sm text-destructive">{errors.quantity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Notas (opcional)</Label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Motivo de la transferencia..."
                                        rows={3}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-destructive">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.quantity || Number(data.quantity) < 1}
                                    >
                                        {processing ? 'Procesando...' : 'Realizar Transferencia'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/stock-transfers">Cancelar</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vista Previa</CardTitle>
                            <CardDescription>
                                Resumen de la transferencia a realizar
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.product_id && data.from_store_id && data.to_store_id && data.quantity ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Package className="h-5 w-5 text-primary" />
                                            <span className="font-medium">
                                                {selectedProduct?.name}
                                            </span>
                                        </div>
                                        <code className="text-sm text-muted-foreground">
                                            {selectedProduct?.sku}
                                        </code>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                                            <div className="text-sm text-muted-foreground">Origen</div>
                                            <div className="font-medium">
                                                {stores.find((s) => String(s.id) === data.from_store_id)?.name}
                                            </div>
                                            <div className="mt-1 text-sm">
                                                <span className="text-muted-foreground">Stock actual:</span>{' '}
                                                <span className="font-medium">{availableStock}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Después:</span>{' '}
                                                <span className="font-medium text-orange-600">
                                                    {availableStock - Number(data.quantity)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <ArrowRight className="h-6 w-6 text-primary" />
                                            <Badge className="mt-1">{data.quantity}</Badge>
                                        </div>

                                        <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                                            <div className="text-sm text-muted-foreground">Destino</div>
                                            <div className="font-medium">
                                                {stores.find((s) => String(s.id) === data.to_store_id)?.name}
                                            </div>
                                            <div className="mt-1 text-sm">
                                                <span className="text-muted-foreground">Stock actual:</span>{' '}
                                                <span className="font-medium">
                                                    {selectedProduct?.stores.find(
                                                        (s) => String(s.id) === data.to_store_id
                                                    )?.pivot.stock || 0}
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Después:</span>{' '}
                                                <span className="font-medium text-green-600">
                                                    {(selectedProduct?.stores.find(
                                                        (s) => String(s.id) === data.to_store_id
                                                    )?.pivot.stock || 0) + Number(data.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>Completa los campos para ver la vista previa</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
