import { useState } from "react";
import { Outlet } from "react-router-dom";
import CharitySidebar from "../components/CharitySidebar";
import CharityHeader from "../components/CharityHeader";

export default function CharityLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // CharityHeader reads auth state itself; layout only controls sidebar state

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <CharitySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <CharityHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
