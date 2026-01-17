import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    message: string;
    canOpenCashRegister: boolean;
}

export default function NoCashRegister({ message, canOpenCashRegister }: Props) {
    return (
        <AppLayout>
            <Head title="Abrir Caja Requerido" />

            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-xl">Caja No Disponible</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Para realizar ventas, primero debes abrir una caja registradora.
                            Esto te permitirá registrar todas las transacciones del día.
                        </p>

                        {canOpenCashRegister && (
                            <Button asChild className="w-full">
                                <Link href="/cash-registers/create">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Abrir Caja
                                </Link>
                            </Button>
                        )}

                        <Button variant="outline" asChild className="w-full">
                            <Link href="/cash-registers">
                                Ver Mis Cajas
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
