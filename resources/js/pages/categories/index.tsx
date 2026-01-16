import { Head, Link, router } from '@inertiajs/react';
import { Edit, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
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
    description: string | null;
    is_active: boolean;
    products_count: number;
    can_be_deleted: boolean;
    deletion_blockers: string[];
    created_by: { id: number; name: string } | null;
    created_at: string;
}

interface CategoriesIndexProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        is_active?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categorías', href: '/categories' },
];

export default function CategoriesIndex({ categories, filters = {} }: CategoriesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/categories',
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const toggleActive = (categoryId: number) => {
        router.patch(`/categories/${categoryId}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const deleteCategory = (categoryId: number) => {
        if (confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
            router.delete(`/categories/${categoryId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
                        <p className="text-sm text-muted-foreground">
                            Organiza tus productos por categorías
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/categories/create">
                            <Plus className="h-4 w-4" />
                            Nueva Categoría
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <Input
                                placeholder="Buscar por nombre..."
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
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                handleFilter('is_active', value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="1">Activas</SelectItem>
                                <SelectItem value="0">Inactivas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categories.data.map((category) => (
                            <div
                                key={category.id}
                                className="group relative rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <FolderOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.products_count} productos
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={category.is_active ? 'default' : 'secondary'}
                                        className="cursor-pointer"
                                        onClick={() => toggleActive(category.id)}
                                    >
                                        {category.is_active ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>

                                {category.description && (
                                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                        {category.description}
                                    </p>
                                )}

                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" variant="outline" asChild className="flex-1">
                                        <Link href={`/categories/${category.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Button>
                                    {category.can_be_deleted ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteCategory(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            title={category.deletion_blockers.join(', ')}
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {categories.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron categorías
                        </div>
                    )}

                    {categories.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {categories.data.length} de {categories.total} categorías
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: categories.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            variant={
                                                page === categories.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                router.get(`/categories?page=${page}`, filters, {
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
