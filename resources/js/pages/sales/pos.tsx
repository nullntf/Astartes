import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    Store,
    Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    sale_price: number;
    cost_price: number;
    stock: number;
}

interface CartItem extends Product {
    quantity: number;
}

interface Store {
    id: number;
    name: string;
    code: string;
}

interface CashRegister {
    id: number;
    store_id: number;
    opening_balance: number;
    status: string;
}

interface Props {
    store: Store;
    cashRegister: CashRegister;
    products: Product[];
    isAdmin: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

export default function POS({ store, cashRegister, products, isAdmin }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
    const [cashReceived, setCashReceived] = useState<string>('');

    const { post, processing } = useForm();

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const term = searchTerm.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(term) ||
                p.sku.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        if (newQty > item.stock) return item;
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
    };

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0),
        [cart]
    );

    const total = useMemo(() => subtotal - discount, [subtotal, discount]);

    const change = useMemo(() => {
        const received = parseFloat(cashReceived) || 0;
        return received - total;
    }, [cashReceived, total]);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setShowPaymentModal(true);
    };

    const processPayment = () => {
        if (paymentMethod === 'efectivo' && change < 0) {
            return;
        }

        const saleData = {
            store_id: store.id,
            cash_register_id: cashRegister.id,
            payment_method: paymentMethod,
            discount: discount,
            tax: 0,
            items: cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.sale_price,
            })),
        };

        router.post('/sales', saleData, {
            onSuccess: () => {
                clearCart();
                setShowPaymentModal(false);
                setCashReceived('');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Punto de Venta" />

            <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
                {/* Panel de Productos */}
                <div className="flex flex-1 flex-col">
                    {/* Header con info de tienda */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Store className="h-6 w-6 text-primary" />
                            <div>
                                <h1 className="text-xl font-bold">{store.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Caja #{cashRegister.id} - {store.code}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {products.length} productos disponibles
                        </Badge>
                    </div>

                    {/* Buscador */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, SKU o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Grid de Productos */}
                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-2 gap-3 pr-4 md:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => {
                                const inCart = cart.find((item) => item.id === product.id);
                                const availableStock = product.stock - (inCart?.quantity || 0);

                                return (
                                    <Card
                                        key={product.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            availableStock === 0 ? 'opacity-50' : ''
                                        }`}
                                        onClick={() => availableStock > 0 && addToCart(product)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="mb-2 flex items-start justify-between">
                                                <Badge variant="secondary" className="text-xs">
                                                    {product.category}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Stock: {availableStock}
                                                </span>
                                            </div>
                                            <h3 className="mb-1 line-clamp-2 text-sm font-medium">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {product.sku}
                                            </p>
                                            <p className="mt-2 text-lg font-bold text-primary">
                                                {formatCurrency(product.sale_price)}
                                            </p>
                                            {inCart && (
                                                <Badge className="mt-2 w-full justify-center">
                                                    {inCart.quantity} en carrito
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Package className="mb-2 h-12 w-12" />
                                <p>No se encontraron productos</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Panel del Carrito */}
                <Card className="w-96 flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Carrito
                            {cart.length > 0 && (
                                <Badge variant="secondary">{cart.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col p-4 pt-0">
                        {cart.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
                                <ShoppingCart className="mb-2 h-12 w-12" />
                                <p>Carrito vacío</p>
                                <p className="text-sm">Agrega productos para comenzar</p>
                            </div>
                        ) : (
                            <>
                                <ScrollArea className="flex-1 -mx-4 px-4">
                                    <div className="space-y-3">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCurrency(item.sale_price)} c/u
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        disabled={item.quantity >= item.stock}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <Separator className="my-4" />

                                {/* Descuento */}
                                <div className="mb-4 flex items-center gap-2">
                                    <Label className="text-sm">Descuento:</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={subtotal}
                                        value={discount || ''}
                                        onChange={(e) =>
                                            setDiscount(
                                                Math.min(
                                                    parseFloat(e.target.value) || 0,
                                                    subtotal
                                                )
                                            )
                                        }
                                        className="h-8 w-24"
                                    />
                                </div>

                                {/* Totales */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span>Descuento:</span>
                                            <span>-{formatCurrency(discount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-primary">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Botones de Acción */}
                                <div className="mt-4 space-y-2">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleCheckout}
                                        disabled={processing}
                                    >
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Procesar Venta
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={clearCart}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Limpiar Carrito
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Pago */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Procesar Pago</DialogTitle>
                        <DialogDescription>
                            Total a cobrar: {formatCurrency(total)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Método de Pago</Label>
                            <Select
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="efectivo">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4" />
                                            Efectivo
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="tarjeta">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Tarjeta
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="transferencia">
                                        <div className="flex items-center gap-2">
                                            <ArrowRightLeft className="h-4 w-4" />
                                            Transferencia
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {paymentMethod === 'efectivo' && (
                            <div className="space-y-2">
                                <Label>Efectivo Recibido</Label>
                                <Input
                                    type="number"
                                    min={total}
                                    step="0.01"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    placeholder={formatCurrency(total)}
                                />
                                {parseFloat(cashReceived) >= total && (
                                    <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950">
                                        <p className="text-sm text-muted-foreground">Cambio:</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(change)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resumen de la venta */}
                        <div className="rounded-lg bg-muted p-3">
                            <p className="mb-2 text-sm font-medium">Resumen:</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Productos:</span>
                                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-destructive">
                                        <span>Descuento:</span>
                                        <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={processPayment}
                            disabled={
                                processing ||
                                (paymentMethod === 'efectivo' && change < 0)
                            }
                        >
                            Confirmar Venta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
