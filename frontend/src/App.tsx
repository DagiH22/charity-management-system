import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User } from "./types/auth";
import { clearAuthToken, getAuthToken, meRequest, setAuthToken } from "./services/auth.api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await meRequest(token);
        setUser(response.user);
      } catch {
        clearAuthToken();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const handleAuthSuccess = (token: string, nextUser: User) => {
    setAuthToken(token);
    setUser(nextUser);
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
  };

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <p className="text-sm font-semibold text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="/login" element={<LoginPage user={user} onAuthSuccess={handleAuthSuccess} />} />
      <Route path="/register" element={<RegisterPage user={user} onAuthSuccess={handleAuthSuccess} />} />
    </Routes>
  );
}
