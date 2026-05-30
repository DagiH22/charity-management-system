import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuthStore } from "../store/authStore";
import { needsCharityProfileSetup } from "../utils/authRouting";

export default function CharityProfileSetupRoute() {
  const { user, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const canResubmitRejectedProfile =
    user.role === "CHARITY" && user.charityVerificationStatus === "REJECTED";

  if (!needsCharityProfileSetup(user) && !canResubmitRejectedProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}