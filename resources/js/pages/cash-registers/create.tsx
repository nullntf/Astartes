import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Store {
    id: number;
    name: string;
    code: string;
}

interface Props {
    stores: Store[];
    isAdmin: boolean;
}

export default function CreateCashRegister({ stores, isAdmin }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        store_id: stores.length === 1 ? stores[0].id.toString() : '',
        opening_balance: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cash-registers');
    };

    return (
        <AppLayout>
            <Head title="Abrir Caja" />

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cash-registers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Wallet className="h-6 w-6" />
                            Abrir Caja
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Inicia una nueva sesión de caja registradora
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de Apertura</CardTitle>
                        <CardDescription>
                            Ingresa los datos necesarios para abrir la caja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="store_id">Tienda *</Label>
                                <Select
                                    value={data.store_id}
                                    onValueChange={(value) => setData('store_id', value)}
                                    disabled={stores.length === 1}
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
                                                {store.name} ({store.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.store_id && (
                                    <p className="text-sm text-destructive">{errors.store_id}</p>
                                )}
                                {stores.length === 1 && (
                                    <p className="text-sm text-muted-foreground">
                                        Solo puedes abrir caja en tu tienda asignada
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opening_balance">Saldo de Apertura *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        id="opening_balance"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.opening_balance}
                                        onChange={(e) => setData('opening_balance', e.target.value)}
                                        className="pl-7"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.opening_balance && (
                                    <p className="text-sm text-destructive">
                                        {errors.opening_balance}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Cantidad de efectivo con la que inicias la caja
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas (opcional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Observaciones adicionales..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Abrir Caja
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/cash-registers">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
