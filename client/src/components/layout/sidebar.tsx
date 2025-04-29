import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileBarChart, 
  Building2, 
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Tv
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { name: "TV View", path: "/tv", icon: <Tv className="mr-3 h-5 w-5" /> },
    { name: "Sales Reports", path: "/reports", icon: <FileBarChart className="mr-3 h-5 w-5" /> },
    { name: "Properties", path: "/properties", icon: <Building2 className="mr-3 h-5 w-5" /> },
    { name: "Agents", path: "/agents", icon: <Users className="mr-3 h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];
  
  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <svg className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-lg font-semibold text-white">Estate Dashboard</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center px-2 py-2 text-base font-medium rounded-md",
                location === item.path
                  ? "bg-gray-900 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex flex-col border-t border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group block mb-3">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center text-white">
              <span className="text-sm font-medium">SJ</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Sarah Johnson</p>
              <p className="text-xs font-medium text-gray-300">Sales Manager</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-white border-gray-600 hover:bg-gray-700"
          onClick={() => {
            fetch('/api/logout', { method: 'POST' })
              .then(() => {
                window.location.href = '/auth';
              })
              .catch(err => {
                console.error('Logout failed:', err);
              });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-20 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
      
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileOpen(false)}></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="text-white hover:text-white"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            
            {renderSidebarContent()}
          </div>
          
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800 text-white">
          {renderSidebarContent()}
        </div>
      </aside>
    </>
  );
}
