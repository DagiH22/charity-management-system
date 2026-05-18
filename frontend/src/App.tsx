import "./index.css";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import CharityProfileSetupPage from "./pages/CharityProfileSetupPage";
import AboutPage from "./pages/AboutPage";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import CharityProfileSetupRoute from "./routes/CharityProfileSetupRoute";
import MyCampaigns from "./pages/MyCampaigns";
import EditCampaign from "./pages/EditCampaignPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";

// Donor Pages
import DonorDonationsPage from "./pages/DonorDonationsPage";
import DonorAnonymousPage from "./pages/DonorAnonymousPage";
import DonorFollowingPage from "./pages/DonorFollowingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/dashboard/create-campaign"
            element={<CreateCampaignPage />}
          />
          <Route path="/dashboard/my-campaigns" element={<MyCampaigns />} />
          <Route
            path="/dashboard/edit-campaign/:id"
            element={<EditCampaign />}
          />
          <Route path="/dashboard/donations" element={<DonorDonationsPage />} />
          <Route
            path="/dashboard/anonymous-donations"
            element={<DonorAnonymousPage />}
          />
          <Route
            path="/dashboard/following-campaigns"
            element={<DonorFollowingPage />}
          />
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
