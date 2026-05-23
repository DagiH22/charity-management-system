import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import CharityProfileSetupPage from "./pages/CharityProfileSetupPage";
import AboutPage from "./pages/AboutPage";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import CharityProfileSetupRoute from "./routes/CharityProfileSetupRoute";
import DonorRoute from "./routes/DonorRoute";
import CharityRoute from "./routes/CharityRoute";
import AdminRoute from "./routes/AdminRoute";
import MyCampaigns from "./pages/MyCampaigns";
import EditCampaign from "./pages/EditCampaignPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import CharityCampaignsPage from "./pages/CharityCampaignsPage";
import CharityContributionsPage from "./pages/CharityContributionsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Donor Pages
import DonorDonationsPage from "./pages/DonorDonationsPage";
import DonorAnonymousPage from "./pages/DonorAnonymousPage";
import DonorFollowingPage from "./pages/DonorFollowingPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminCharityVerificationPage from "./pages/admin/AdminCharityVerificationPage";
import AdminCampaignOversightPage from "./pages/admin/AdminCampaignOversightPage";
import AdminDonationLogsPage from "./pages/admin/AdminDonationLogsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          <Route element={<CharityRoute />}>
            <Route
              path="/dashboard/create-campaign"
              element={<CreateCampaignPage />}
            />
            <Route path="/dashboard/my-campaigns" element={<MyCampaigns />} />
            <Route
              path="/dashboard/edit-campaign/:id"
              element={<EditCampaign />}
            />
            <Route
              path="/charity/campaigns"
              element={<CharityCampaignsPage />}
            />
            <Route
              path="/charity/contributions"
              element={<CharityContributionsPage />}
            />
          </Route>

          <Route element={<DonorRoute />}>
            <Route
              path="/dashboard/donations"
              element={<DonorDonationsPage />}
            />
            <Route
              path="/dashboard/anonymous-donations"
              element={<DonorAnonymousPage />}
            />
            <Route
              path="/dashboard/following-campaigns"
              element={<DonorFollowingPage />}
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
            <Route
              path="/admin/charity-verification"
              element={<AdminCharityVerificationPage />}
            />
            <Route
              path="/admin/campaigns"
              element={<AdminCampaignOversightPage />}
            />
            <Route path="/admin/donations" element={<AdminDonationLogsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<CharityProfileSetupRoute />}>
        <Route
          path="/charity-profile/setup"
          element={<CharityProfileSetupPage />}
        />
      </Route>
    </Routes>
  );
}
