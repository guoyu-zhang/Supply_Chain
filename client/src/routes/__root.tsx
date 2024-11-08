import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import "../index.css";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sidebar } from "@/components/sidebar";
import { SearchForm } from "@/components/search-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <>
            <QueryClientProvider client={queryClient}>
                <SidebarProvider className="flex flex-row">
                    <Sidebar />

                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <SidebarTrigger className="-ml-1" />
                        </header>
                        <Outlet />
                        <Link to="/create">
                            <Button className="z-50 fixed right-0 bottom-0 m-5 p-5">
                                Create Order
                            </Button>
                        </Link>
                    </SidebarInset>
                </SidebarProvider>
            </QueryClientProvider>
        </>
    ),
});
