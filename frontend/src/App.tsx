import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CharityProfileSetupPage from "./pages/CharityProfileSetupPage";
import AboutPage from "./pages/AboutPage";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import CharityProfileSetupRoute from "./routes/CharityProfileSetupRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<CharityProfileSetupRoute />}>
        <Route path="/charity-profile/setup" element={<CharityProfileSetupPage />} />
      </Route>
    </Routes>
  );
}
