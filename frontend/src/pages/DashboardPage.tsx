import { useAuthStore } from "../store/authStore";
import AdminDashboard from "./dashboard/AdminDashboard";
import UserDashboard from "./dashboard/UserDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <UserDashboard user={user} />;
}
