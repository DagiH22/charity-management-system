import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";
import { needsCharityProfileSetup } from "../utils/authRouting";

export default function ProtectedRoute() {
  const { user, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsCharityProfileSetup(user)) {
    return <Navigate to="/charity-profile/setup" replace />;
  }

  return <Outlet />;
}