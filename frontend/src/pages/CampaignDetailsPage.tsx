import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPublicCampaignById,
  donateToCampaignRequest,
} from "../services/campaign.api";
import { useAuthStore } from "../store/authStore";
import { getAuthToken } from "../services/auth.api";
import FullScreenLoader from "../components/FullScreenLoader";
import {
  getDonorFollowingCampaigns,
  toggleFollowCampaign,
} from "../services/donor.api";
import { resolveAssetUrl } from "../utils/media";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

const VerifiedIcon = () => (
  <svg
    className="h-4 w-4 text-emerald-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const donateSectionRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const userRole = user?.role;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isStoryExpanded, setIsExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [donationError, setDonationError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn && user) {
      setDonorName(user.name || "");
      setDonorEmail(user.email || "");
    }
  }, [user, isLoggedIn]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPublicCampaignById(id);
      setCampaign(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoggedIn || !campaign) return;
    const fetchFollowStatus = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const result = await getDonorFollowingCampaigns(token, {
          page: 1,
          limit: 100,
        });
        const follows = (result.data?.items || []) as Array<{
          campaignId: number;
        }>;
        const isFollowed = follows.some(
          (follow) => follow.campaignId === campaign.id,
        );
        setIsFollowing(Boolean(isFollowed));
      } catch {
        setIsFollowing(false);
      }
    };
    fetchFollowStatus();
  }, [campaign, isLoggedIn]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (
      campaign &&
      (location.hash === "#donate" || location.state?.scrollToDonate)
    ) {
      setTimeout(() => {
        if (donateSectionRef.current) {
          donateSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          donateSectionRef.current.classList.add(
            "ring-4",
            "ring-emerald-500",
            "ring-offset-2",
          );
          setTimeout(
            () =>
              donateSectionRef.current?.classList.remove(
                "ring-4",
                "ring-emerald-500",
                "ring-offset-2",
              ),
            2000,
          );
        }
      }, 100);
    }
  }, [location, campaign]);

  if (loading) return <FullScreenLoader />;
  if (error || !campaign) {
    return (
      <div className="py-20 text-center text-red-500">
        {error || "Campaign not found"}
      </div>
    );
  }

  const percentComplete = Math.min(
    Math.round(
      (Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100,
    ),
    100,
  );
  const daysRemaining = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : "No limit";

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      setToastMessage("You need to be logged in to follow campaigns.");
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) return;
      const result = await toggleFollowCampaign(token, campaign.id);
      setIsFollowing(Boolean(result.followed));
      setToastMessage(
        result.followed
          ? "Campaign added to your following list."
          : "Campaign removed from your following list.",
      );
    } catch {
      setToastMessage("Failed to update follow status.");
    }
  };

  const handleAmountClick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const currentDonationValue = selectedAmount || parseFloat(customAmount) || 0;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn)
      return alert("You must be logged in as a donor to donate.");
    if (currentDonationValue < 10) return alert("Minimum donation is 10 ETB.");

    setDonationError("");
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Missing auth token");

      const payload = {
        amount: currentDonationValue,
        isAnonymous,
        message: undefined,
      };

      const res = await donateToCampaignRequest(token, id, payload);

      const donation = res.data.donation;

      setReceiptData({
        id: donation.transactionId,
        name: isAnonymous ? "Anonymous Donor" : donorName,
        campaign: campaign.title,
        amount: Number(donation.amount),
        method: "Chapa Payment",
        date: new Date(donation.donatedAt).toLocaleDateString(),
        status: donation.status,
      });
      setShowReceipt(true);

      await loadData();
    } catch (err: any) {
      setDonationError(err.response?.data?.message || "Donation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-[#0b2b53] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      <div className="relative h-[300px] w-full overflow-hidden rounded-2xl md:h-[400px]">
        <img
          src={
            resolveAssetUrl(campaign.imageUrl) ||
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80"
          }
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <span
            className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm ${campaign.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-500"}`}
          >
            {campaign.status}
          </span>
          <h1 className="text-2xl font-extrabold text-white md:text-4xl lg:text-5xl">
            {campaign.title}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={
                    resolveAssetUrl(campaign.charity.logo) ||
                    "https://ui-avatars.com/api/?name=C&background=0b2b53&color=fff"
                  }
                  alt={campaign.charity.organizationName}
                  className="h-12 w-12 rounded-full border border-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#0b2b53]">
                    {campaign.charity.organizationName}
                    {campaign.charity.verifiedAt && <VerifiedIcon />}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {campaign.charity.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFollowToggle}
                disabled={!isLoggedIn || user?.role !== "DONOR"}
                className={`hidden md:inline-flex rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>

            <div className="pt-5">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-3xl font-extrabold text-[#0b2b53]">
                    {Number(campaign.currentAmount).toLocaleString()} ETB
                  </span>
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    raised of {Number(campaign.targetAmount).toLocaleString()}{" "}
                    ETB
                  </span>
                </div>
                <span className="font-bold text-emerald-500">
                  {percentComplete}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <UserIcon /> {campaign.donorCount} Donors
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon /> {daysRemaining} Days Left
                </div>
                <div className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-blue-700 font-bold uppercase text-[10px]">
                  Status: {campaign.status}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-extrabold text-[#0b2b53]">
              About the Campaign
            </h2>
            <div
              className={`prose max-w-none text-slate-600 ${!isStoryExpanded ? "line-clamp-4" : ""}`}
            >
              {campaign.description
                .split("\n")
                .map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                ))}
            </div>
            {campaign.description.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isStoryExpanded)}
                className="mt-2 font-bold text-emerald-500 hover:text-emerald-600 hover:underline"
              >
                {isStoryExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Mock Share section left as is for styling */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
            <span className="font-bold text-slate-700">Share:</span>
            <button className="rounded-full bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 transition">
              Copy Link
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          {userRole !== "CHARITY" && (
            <div
              ref={donateSectionRef}
              className="sticky top-24 rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(10,40,80,0.08)] transition-all duration-300"
            >
              <h2 className="mb-6 text-2xl font-extrabold text-[#0b2b53]">
                Make a Donation
              </h2>

              {donationError && (
                <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg text-sm">
                  {donationError}
                </div>
              )}

              {campaign.status === "CLOSED" ? (
                <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-600 font-bold">
                  This campaign is closed to new donations.
                </div>
              ) : isLoggedIn ? (
                <form onSubmit={handleDonate} className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700">
                      Select Amount (ETB)
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountClick(amt)}
                          className={`rounded-xl border py-2.5 text-center font-bold transition-all ${
                            selectedAmount === amt
                              ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-500"
                          }`}
                        >
                          {amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        ETB
                      </span>
                      <input
                        type="number"
                        min="10"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        onClick={() => setSelectedAmount(null)}
                        className={`w-full rounded-xl border py-3 pl-14 pr-4 transition-all focus:outline-none focus:ring-2 ${customAmount || selectedAmount === null ? "border-emerald-500 bg-emerald-50 focus:ring-emerald-500/20" : "border-slate-200 bg-white focus:border-emerald-500 focus:ring-emerald-500/20"}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    {isLoggedIn ? (
                      <div className="mb-2 text-xs font-semibold text-emerald-600 flex justify-between">
                        <span>Using your account information</span>
                      </div>
                    ) : (
                      <div className="mb-2 text-xs font-semibold text-amber-600 flex justify-between">
                        <span>Please login before donating</span>
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        disabled={isLoggedIn}
                        placeholder="Your Name"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {isLoggedIn && (
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={donorEmail}
                          disabled
                          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    )}

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Donate Anonymously
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:opacity-70 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Donate via Chapa</span>
                        <svg
                          className="w-5 h-5 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-4 text-emerald-600">
                    <svg
                      className="w-16 h-16 mx-auto opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">
                    Login Required
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    You must be logged in to a Donor account to make a donation.
                  </p>
                  <a
                    href="/login"
                    className="inline-block w-full rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-600"
                  >
                    Login / Register to Donate
                  </a>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>{" "}
                Secure donation processing
              </div>
            </div>
          )}
        </div>
      </div>

      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md scale-100 transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            <div className="bg-emerald-500 p-6 text-center text-white relative">
              <button
                onClick={() => setShowReceipt(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              ></button>
              <h3 className="text-2xl font-extrabold">Donation Successful!</h3>
              <p className="mt-1 opacity-90">Thank you for your generosity.</p>
            </div>
            <div className="p-8">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Receipt ID</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Donor Name</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Campaign</span>
                  <span className="font-bold text-[#0b2b53] max-w-[200px] truncate">
                    {receiptData.campaign}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.method}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-slate-700">
                    Total Donated
                  </span>
                  <span className="text-xl font-extrabold text-emerald-500">
                    {receiptData.amount.toLocaleString()} ETB
                  </span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition hover:bg-slate-200">
                  Print
                </button>
                <button className="flex-1 rounded-xl bg-[#0b2b53] py-3 font-bold text-white transition hover:bg-slate-800">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
