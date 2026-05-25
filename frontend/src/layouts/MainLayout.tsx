import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <NavBar />
      <main className={isHomePage ? "flex-1" : "px-[6vw] py-12 flex-1"}>
        <Outlet />
      </main>
    </div>
  );
}
