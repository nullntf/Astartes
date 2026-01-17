import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRightLeft,
    DollarSign,
    LayoutGrid,
    Package,
    Receipt,
    ShoppingCart,
    Store,
    Tag,
    Users,
    Wallet,
} from 'lucide-react';
import { useMemo } from 'react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { isAdmin, isVendedor, isBodega } = auth;

    const mainNavItems = useMemo<NavItem[]>(() => {
        // Admin: acceso completo
        if (isAdmin) {
            return [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                { title: 'Punto de Venta', href: '/sales/create', icon: ShoppingCart },
                { title: 'Historial Ventas', href: '/sales', icon: Receipt },
                { title: 'Cajas', href: '/cash-registers', icon: Wallet },
                { title: 'Usuarios', href: '/users', icon: Users },
                { title: 'Tiendas', href: '/stores', icon: Store },
                { title: 'Categorías', href: '/categories', icon: Tag },
                { title: 'Productos', href: '/products', icon: Package },
                { title: 'Sin Stock', href: '/products/out-of-stock', icon: AlertTriangle },
                { title: 'Transferencias', href: '/stock-transfers', icon: ArrowRightLeft },
                { title: 'Gastos', href: '/expenses', icon: DollarSign },
            ];
        }

        // Vendedor: dashboard, POS, historial ventas
        if (isVendedor) {
            return [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                { title: 'Punto de Venta', href: '/sales/create', icon: ShoppingCart },
                { title: 'Mis Ventas', href: '/sales', icon: Receipt },
            ];
        }

        // Bodega: dashboard, categorías, productos, sin stock, transferencias
        if (isBodega) {
            return [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                { title: 'Categorías', href: '/categories', icon: Tag },
                { title: 'Productos', href: '/products', icon: Package },
                { title: 'Sin Stock', href: '/products/out-of-stock', icon: AlertTriangle },
                { title: 'Transferencias', href: '/stock-transfers', icon: ArrowRightLeft },
            ];
        }

        return [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];
    }, [isAdmin, isVendedor, isBodega]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
