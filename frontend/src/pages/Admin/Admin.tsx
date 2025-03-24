import React from "react";
import {
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Home, Inbox, Calendar, Search, Settings, User } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { FaUsers } from "react-icons/fa";

const Admin = () => {
  return (
    <AdminLayout>
      <div className="py-6">
        <Outlet />
      </div>
    </AdminLayout>
  );
};

export default Admin;

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <SidebarProvider>
        <AdminSidebar />
        <main className="container relative flex-1 p-4">
          <div className="absolute top-4 left-4">
            {/* @ts-ignore */}
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};

const AdminSidebar = () => {
  const items = [
    {
      title: "Users",
      url: "users",
      icon: User,
    },
    {
      title: "Courses",
      url: "courses",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
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
};
