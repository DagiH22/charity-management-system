import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import type { User } from "../types/auth";

type MainLayoutProps = {
  user: User | null;
  onLogout: () => void;
};

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar user={user} onLogout={onLogout} />
      <main className="px-[6vw] py-12">
        <Outlet />
      </main>
    </div>
  );
}
