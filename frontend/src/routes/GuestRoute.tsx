import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";
import { getPostAuthRedirectPath } from "../utils/authRouting";

export default function GuestRoute() {
  const { user, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <Navigate to={getPostAuthRedirectPath(user)} replace />;
  }

  return <Outlet />;
}