import { Map, Building2, Truck, Package, FileText } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const items = [
    {
        title: "Map",
        url: "/map",
        icon: Map,
    },
    {
        title: "Warehouses",
        url: "/warehouses",
        icon: Building2,
    },
    {
        title: "Carriers",
        url: "/carriers",
        icon: Truck,
    },
    {
        title: "Articles",
        url: "/articles",
        icon: Package,
    },
    {
        title: "Orders",
        url: "/orders",
        icon: FileText,
    },
];

export function AppSidebar() {
    const location = useLocation();

    return (
        <Sidebar className="flex-grow">
            <SidebarHeader>
                <div className="px-2 py-2 flex items-center gap-3">
                    <img
                        src="/rhenus.png"
                        alt="Rhenus"
                        className="h-8 w-auto"
                    />
                    <h2 className="text-lg font-semibold hidden">Rhenus</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                    >
                                        <Link to={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}