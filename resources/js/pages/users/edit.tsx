import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Store {
    id: number;
    name: string;
}

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'bodega' | 'vendedor';
    store_id: number | null;
    store?: Store;
    is_active: boolean;
}

interface EditUserProps {
    user: User;
    stores: Store[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/users' },
    { title: 'Editar Usuario', href: '#' },
];

export default function EditUser({ user, stores }: EditUserProps) {
    const { data, setData, put, processing, errors } = useForm({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        is_active: user.is_active,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Usuario - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href="/users">
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Usuario</h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza la información del usuario
                    </p>
                </div>

                <div className="max-w-2xl rounded-lg border bg-card p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Nombre de Usuario <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre Completo <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Correo Electrónico <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Nueva Contraseña (opcional)
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Dejar en blanco para no cambiar"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar Nueva Contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Repite la contraseña"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Solo completa estos campos si deseas cambiar la contraseña
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Rol <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    name="role"
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value as 'admin' | 'bodega' | 'vendedor')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="bodega">Bodega</SelectItem>
                                        <SelectItem value="vendedor">Vendedor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            {data.role === 'vendedor' && (
                                <div className="space-y-2">
                                    <Label htmlFor="store_id">
                                        Tienda <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        name="store_id"
                                        value={data.store_id?.toString() || ''}
                                        onValueChange={(value) =>
                                            setData('store_id', parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una tienda" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <InputError message={errors.store_id} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                name="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked as boolean)
                                }
                            />
                            <Label htmlFor="is_active" className="font-normal">
                                Usuario activo
                            </Label>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/users">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Actualizar Usuario
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
