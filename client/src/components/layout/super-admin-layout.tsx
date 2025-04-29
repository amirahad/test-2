import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Building2, Database, Home, LogOut, Menu, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    {
      name: "Agencies",
      href: "/super-admin/agencies",
      icon: <Building2 className="h-5 w-5 mr-3" />,
      current: location === "/super-admin/agencies",
    },
    {
      name: "Properties",
      href: "/super-admin/properties",
      icon: <Database className="h-5 w-5 mr-3" />,
      current: location === "/super-admin/properties",
    },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="py-6 px-4">
        <div className="flex items-center mb-8">
          <Home className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold ml-2 text-blue-600">Super Admin</h1>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg",
                item.current
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - only show on desktop */}
      {!isMobile && (
        <div className="w-64 bg-white border-r">
          <NavContent />
        </div>
      )}

      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="fixed top-4 left-4 z-50 p-2 rounded-full"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-bold">Super Admin Portal</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}