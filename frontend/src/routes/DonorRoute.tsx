import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";

export default function DonorRoute() {
  const { user, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  // Allow GUESTS (!user) or DONORS to see the routes.
  // Other authenticated roles (Admin/Charity) get bumped to their dash.
  if (user && user.role !== "DONOR") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
