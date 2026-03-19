import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BottomNavBar } from "./BottomNavBar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomNavBar />
    </div>
  );
}
