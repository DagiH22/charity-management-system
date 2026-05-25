import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  getPublicCampaignById,
  donateToCampaignRequest,
  getDonationByTxRef,
} from "../services/campaign.api";
import { useAuthStore } from "../store/authStore";
import FullScreenLoader from "../components/FullScreenLoader";
import {
  getDonorFollowingCampaigns,
  toggleFollowCampaign,
} from "../services/donor.api";
import { resolveAssetUrl } from "../utils/media";
import { getDonationReceipt } from "../services/donation.api";
import { generateReceiptPDF, type ReceiptPDFData } from "../utils/receiptPdf";
import DonorSidebar from "../components/DonorSidebar";
import {
  BadgeCheck,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  XIcon,
} from "lucide-react";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

const formatReadableDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

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
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptPDFData | null>(null);
  const [donationError, setDonationError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const isDonorOrGuest = !user || user.role === "DONOR";
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    if (!isDonorOrGuest) return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = () => setSidebarOpen(mediaQuery.matches);
    syncSidebar();
    mediaQuery.addEventListener("change", syncSidebar);
    return () => mediaQuery.removeEventListener("change", syncSidebar);
  }, [isDonorOrGuest]);

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

  // If Chapa redirected back with tx_ref, fetch donation status and show receipt
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txRef =
      params.get("tx_ref") ||
      params.get("txref") ||
      params.get("ref_id") ||
      params.get("transactionId");

    console.log("🔍 Checking for Chapa redirect...");
    console.log("📍 Current URL:", window.location.href);
    console.log("🔑 Query params:", Object.fromEntries(params));
    console.log("💳 TX_REF found:", txRef);

    // Check sessionStorage for donation info stored before Chapa redirect
    let donationFromStorage = null;
    try {
      const stored = sessionStorage.getItem("chapaRedirectDonation");
      if (stored) {
        donationFromStorage = JSON.parse(stored);
        console.log(
          "📦 Found donation in sessionStorage:",
          donationFromStorage,
        );
      }
    } catch (err) {
      console.error("Error reading from sessionStorage:", err);
    }

    // If neither URL param nor storage, nothing to do
    if (!txRef && !donationFromStorage) {
      console.log("⚠️ No transaction reference found, skipping receipt fetch");
      return;
    }

    const fetchDonation = async () => {
      const txRefToUse = txRef || donationFromStorage?.tx_ref;

      if (!txRefToUse) {
        console.error("❌ No tx_ref available to fetch donation");
        return;
      }

      try {
        console.log("🚀 Fetching donation details for tx_ref:", txRefToUse);
        const res = await getDonationByTxRef(txRefToUse);
        console.log("✅ Donation fetched successfully:", res);
        const donation = res.data.donation;

        // CHECK PAYMENT STATUS - Only show receipt if COMPLETED
        if (donation.status !== "COMPLETED") {
          console.warn("⚠️ Payment not completed. Status:", donation.status);
          if (donation.status === "FAILED") {
            setDonationError("❌ Payment failed. Please try again.");
          } else if (donation.status === "PENDING") {
            setDonationError("⏳ Payment is still pending. Please wait...");
          } else {
            setDonationError("❌ Payment was not successful.");
          }
          // Clean up storage
          sessionStorage.removeItem("chapaRedirectDonation");
          await loadData();
          return;
        }

        // Payment successful - show receipt
        const receiptResponse = res.data.receipt
          ? { data: res.data.receipt }
          : await getDonationReceipt(Number(donation.id));

        setReceiptData({
          ...receiptResponse.data,
          paymentMethod: receiptResponse.data.paymentMethod || "Chapa Payment",
        });
        setShowReceiptDetails(false);
        console.log("🎫 Receipt data set from API, showing modal");
        setShowReceipt(true);

        // Clean up storage
        sessionStorage.removeItem("chapaRedirectDonation");
        await loadData();
      } catch (err: any) {
        console.error("❌ Error fetching donation details:", err);
        console.error("Error response:", err.response);
        console.error("Error message:", err.message);

        setDonationError(
          "❌ Could not verify payment status. Please contact support.",
        );
        sessionStorage.removeItem("chapaRedirectDonation");
      }
    };

    void fetchDonation();
  }, [location.search, campaign, donorName, loadData]);

  useEffect(() => {
    if (!isLoggedIn || !campaign) return;
    const fetchFollowStatus = async () => {
      try {
        const result = await getDonorFollowingCampaigns({
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
      const result = await toggleFollowCampaign(campaign.id);
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
    if (isLoggedIn && userRole !== "DONOR") {
      setDonationError("Only Donors can make donations.");
      return;
    }

    if (currentDonationValue < 10) {
      setDonationError("Minimum donation is 10 ETB.");
      return;
    }

    if (!isLoggedIn) {
      if (!donorName.trim() || !donorEmail.trim()) {
        setDonationError("Full Name and Email Address are required for guest donations.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(donorEmail)) {
        setDonationError("Please enter a valid email address.");
        return;
      }
    }

    setDonationError("");
    setIsSubmitting(true);

    try {
      const payload = {
        amount: currentDonationValue,
        isAnonymous,
        message: undefined,
        returnUrl: window.location.href,
        guestName: !isLoggedIn ? donorName : undefined,
        guestEmail: !isLoggedIn ? donorEmail : undefined,
      };

      const res = await donateToCampaignRequest(id, payload);

      // If backend provided chapa checkout data, submit a form to Chapa hosted pay
      const checkout = res.data as unknown as {
        donation: any;
        chapa: { actionUrl: string; fields: Record<string, string> };
      };

      // Store donation info in sessionStorage before redirecting to Chapa
      const donationInfo = {
        tx_ref: checkout.chapa.fields.tx_ref,
        amount: checkout.chapa.fields.amount,
        donorName: isAnonymous ? "Anonymous Donor" : donorName,
        campaign: campaign?.title || "",
        method: "Chapa Payment",
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem(
        "chapaRedirectDonation",
        JSON.stringify(donationInfo),
      );
      console.log("💾 Stored donation info in sessionStorage:", donationInfo);

      // Build and submit a form to Chapa hosted endpoint
      const form = document.createElement("form");
      form.action = checkout.chapa.actionUrl;
      form.method = "POST";
      form.style.display = "none";

      Object.entries(checkout.chapa.fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v ?? "");
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err: any) {
      setDonationError(err.response?.data?.message || "Donation failed.");
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!receiptData) {
      return;
    }

    generateReceiptPDF(receiptData);
  };

  const renderContent = () => (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb */}
      {isDonorOrGuest && (
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
          <a
            href="/campaigns"
            className="hover:text-slate-900 transition-colors"
          >
            Campaigns
          </a>
          <ChevronRight className="h-4 w-4 opacity-50" />
          <span className="text-slate-900 truncate max-w-[200px]">
            {campaign.title}
          </span>
        </div>
      )}

      <div className="relative h-[300px] w-full overflow-hidden rounded-3xl md:h-[450px] shadow-sm">
        <img
          src={
            resolveAssetUrl(campaign.imageUrl) ||
            "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80"
          }
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
          <span
            className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${campaign.status === "ACTIVE" ? "bg-emerald-500/90" : "bg-slate-500/90"}`}
          >
            {campaign.status === "ACTIVE" && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
            {campaign.status}
          </span>
          <h1 className="text-3xl font-extrabold text-white md:text-5xl lg:text-6xl drop-shadow-sm leading-tight max-w-4xl">
            {campaign.title}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
          {/* Charity Profile Header & Progress */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={
                      resolveAssetUrl(campaign.charity.logo) ||
                      "https://ui-avatars.com/api/?name=C&background=0b2b53&color=fff"
                    }
                    alt={campaign.charity.organizationName}
                    className="h-16 w-16 rounded-2xl border bg-white object-cover border-slate-200 shadow-sm"
                  />
                  {campaign.charity.verifiedAt && (
                    <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-0.5">
                      <BadgeCheck className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 group">
                    {campaign.charity.organizationName}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-0.5 max-w-md truncate">
                    {campaign.charity.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFollowToggle}
                disabled={!isLoggedIn || user?.role !== "DONOR"}
                className={`hidden md:inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-50 ${
                  isFollowing
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow"
                }`}
              >
                {isFollowing ? "Following" : "Follow Organization"}
              </button>
            </div>

            <div className="p-6 md:p-8 bg-slate-50/50">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {Number(campaign.currentAmount).toLocaleString()}{" "}
                    <span className="text-xl text-slate-400">ETB</span>
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    raised of {Number(campaign.targetAmount).toLocaleString()}{" "}
                    ETB target
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-500">
                    {percentComplete}%
                  </span>
                </div>
              </div>

              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200/60 shadow-inner">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out flex items-center justify-end px-2"
                  style={{ width: `${percentComplete}%` }}
                >
                  {percentComplete > 10 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200/50 shadow-sm">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-900">
                    {campaign.donorCount}
                  </span>{" "}
                  Donors
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200/50 shadow-sm">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-slate-900">{daysRemaining}</span> Days
                  Left
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/50 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900 flex items-center gap-3">
              About the Campaign
            </h2>
            <div
              className={`prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed ${!isStoryExpanded ? "line-clamp-4 md:line-clamp-6" : ""}`}
            >
              {campaign.description
                .split("\n")
                .map((paragraph: string, idx: number) => (
                  <p key={idx} className={`${idx !== 0 && "mt-4"}`}>
                    {paragraph}
                  </p>
                ))}
            </div>
            {campaign.description.length > 300 && (
              <button
                onClick={() => setIsExpanded(!isStoryExpanded)}
                className="mt-4 flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 group transition-colors"
              >
                {isStoryExpanded ? "Read Less" : "Read Full Story"}
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isStoryExpanded ? "-rotate-90" : "group-hover:translate-x-1"}`}
                />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 min-h-0">
          {userRole !== "CHARITY" && (
            <div
              ref={donateSectionRef}
              className="sticky top-8 rounded-3xl bg-white p-6 md:p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/50 transition-all duration-300"
            >
              <h2 className="mb-6 text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                Make a Donation
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </h2>

              {donationError && (
                <div className="mb-6 flex flex-col gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      <XIcon className="h-4 w-4" /> Error
                    </span>
                    <button
                      onClick={() => setDonationError("")}
                      className="text-red-400 hover:text-red-600 bg-white/50 rounded-full p-1 transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-medium text-red-500">
                    {donationError}
                  </span>
                </div>
              )}

              {campaign.status === "CLOSED" ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-600 font-bold border border-slate-100">
                  This campaign is closed to new donations.
                </div>
              ) : userRole !== "CHARITY" ? (
                <form onSubmit={handleDonate} className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700">
                      Select Amount (ETB)
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountClick(amt)}
                          className={`rounded-xl border py-3 text-center font-bold text-lg transition-all ${
                            selectedAmount === amt
                              ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
                        className={`w-full rounded-xl border py-3.5 pl-14 pr-4 font-bold text-lg transition-all focus:outline-none focus:ring-4 ${customAmount || selectedAmount === null ? "border-emerald-500 bg-white focus:ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 hover:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
                        Donor Details
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          disabled={isLoggedIn}
                          placeholder="Your Full Name"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          required
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          disabled={isLoggedIn}
                          placeholder="Email Address"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400 transition-all"
                          />
                          <svg
                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.0
