import * as React from "react";

import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

// This is sample data.
const data = {
  navMain: [
    {
      title: "General",
      url: "/",
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Products",
          url: "/products",
        },
      ],
    },
  ],
};

function SidebarItem({ icon }) { }

export function Sidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarComponent {...props}>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            {/* <SidebarGroupLabel>{item.title}</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                    >
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem key="Create">
                  <SidebarMenuButton asChild isActive={false}>
                    <Link to="/create">
                      <Button className="w-full  p-5">
                        Create Order
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </SidebarComponent>
  );
}
