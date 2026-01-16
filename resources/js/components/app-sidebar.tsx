import { Link } from '@inertiajs/react';
import {
    DollarSign,
    LayoutGrid,
    Package,
    ShoppingCart,
    Store,
    Tag,
    Users,
    Wallet,
} from 'lucide-react';

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
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Tiendas',
        href: '/stores',
        icon: Store,
    },
    {
        title: 'Categorías',
        href: '/categories',
        icon: Tag,
    },
    {
        title: 'Productos',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Ventas',
        href: '/sales',
        icon: ShoppingCart,
    },
    {
        title: 'Cajas',
        href: '/cash-registers',
        icon: Wallet,
    },
    {
        title: 'Gastos',
        href: '/expenses',
        icon: DollarSign,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
