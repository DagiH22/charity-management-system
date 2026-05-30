import { useAuthStore } from "../store/authStore";
import AdminDashboard from "./dashboard/AdminDashboard";
import CharityDashboard from "./dashboard/CharityDashboard";
import DonorDashboard from "./dashboard/DonorDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user.role === "CHARITY") {
    return <CharityDashboard user={user} />;
  }

  return <DonorDashboard user={user} />;
}
