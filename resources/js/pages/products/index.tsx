import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
    can_be_deleted: boolean;
    deletion_blockers: string[];
    total_stock: number;
    created_at: string;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        category_id?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value);
}

export default function ProductsIndex({ products, categories, filters }: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/products',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const toggleActive = (productId: number) => {
        router.patch(`/products/${productId}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const deleteProduct = (productId: number) => {
        if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
            router.delete(`/products/${productId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona el catálogo de productos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/products/stock">
                                <Package className="h-4 w-4" />
                                Asignar Stock
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/products/create">
                                <Plus className="h-4 w-4" />
                                Nuevo Producto
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <Input
                                placeholder="Buscar por nombre o SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" variant="secondary">
                                <Search className="h-4 w-4" />
                                Buscar
                            </Button>
                        </form>

                        <Select
                            value={filters.category_id || 'all'}
                            onValueChange={(value) =>
                                handleFilter('category_id', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar por categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Producto
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Categoría
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Costo
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Precio
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{product.name}</div>
                                                {product.description && (
                                                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                                                        {product.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-2 py-1 text-sm">
                                                    {product.sku}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {product.category.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {formatCurrency(product.cost_price)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                {formatCurrency(product.sale_price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={product.is_active ? 'default' : 'secondary'}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleActive(product.id)}
                                                >
                                                    {product.is_active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/products/${product.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/products/${product.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {product.can_be_deleted ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteProduct(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            disabled
                                                            title={product.deletion_blockers.join(', ')}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {products.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron productos
                        </div>
                    )}

                    {products.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {products.data.length} de {products.total} productos
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: products.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={
                                                page === products.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                router.get(`/products?page=${page}`, filters, {
                                                    preserveState: true,
                                                })
                                            }
                                        >
                                            {page}
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
