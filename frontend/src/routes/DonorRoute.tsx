import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";

export default function DonorRoute() {
  const { user, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "DONOR") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
