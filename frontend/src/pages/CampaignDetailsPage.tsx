import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link as RouterLink } from "react-router-dom";
import {
  getPublicCampaignById,
  donateToCampaignRequest,
  getDonationByTxRef,
} from "../services/campaign.api";
import formatCurrency from "../utils/format";
import { useAuthStore } from "../store/authStore";
import FullScreenLoader from "../components/FullScreenLoader";
import {
  getDonorFollowingCampaigns,
  toggleFollowCampaign,
} from "../services/donor.api";
import { resolveAssetUrl } from "../utils/media";
import { getDonationReceipt } from "../services/donation.api";
import { generateReceiptPDF, type ReceiptPDFData } from "../utils/receiptPdf";
import { Link as LinkIcon, CheckCircle2 } from "lucide-react";
import CategoryBadge from "../components/CategoryBadge";

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

type SocialKey =
  | "socialFacebook"
  | "socialInstagram"
  | "socialTwitter"
  | "socialYoutube"
  | "socialTelegram"
  | "socialTiktok";

const SocialIcon = ({ platform }: { platform: SocialKey }) => {
  switch (platform) {
    case "socialFacebook":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "socialInstagram":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case "socialTwitter":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case "socialYoutube":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "socialTiktok":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case "socialTelegram":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.984 8.535l-1.977 9.32c-.15.733-.537.915-1.088.569l-3.01-2.22-1.452 1.397c-.16.161-.295.295-.605.295l.217-3.053 5.553-5.019c.242-.22-.053-.34-.373-.12l-6.869 4.332-2.963-.924c-.644-.203-.66-.644.135-.956l11.569-4.461c.54-.203 1.01.132.84.953z" />
        </svg>
      );
    default:
      return null;
  }
};

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
  const [isCopied, setIsCopied] = useState(false);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    console.log("ðŸ” Checking for Chapa redirect...");
    console.log("ðŸ“ Current URL:", window.location.href);
    console.log("ðŸ”‘ Query params:", Object.fromEntries(params));
    console.log("ðŸ’³ TX_REF found:", txRef);

    // Check sessionStorage for donation info stored before Chapa redirect
    let donationFromStorage = null;
    try {
      const stored = sessionStorage.getItem("chapaRedirectDonation");
      if (stored) {
        donationFromStorage = JSON.parse(stored);
        console.log(
          "ðŸ“¦ Found donation in sessionStorage:",
          donationFromStorage,
        );
      }
    } catch (err) {
      console.error("Error reading from sessionStorage:", err);
    }

    // If neither URL param nor storage, nothing to do
    if (!txRef && !donationFromStorage) {
      console.log("âš ï¸ No transaction reference found, skipping receipt fetch");
      return;
    }

    let isCancelled = false;

    const fetchDonation = async () => {
      const txRefToUse = txRef || donationFromStorage?.tx_ref;

      if (!txRefToUse) {
        console.error("âŒ No tx_ref available to fetch donation");
        return;
      }

      try {
        console.log("ðŸš€ Fetching donation details for tx_ref:", txRefToUse);
        const res = await getDonationByTxRef(txRefToUse);
        console.log("âœ… Donation fetched successfully:", res);
        const donation = res.data.donation;

        if (isCancelled) {
          return;
        }

        // CHECK PAYMENT STATUS - Only show receipt if COMPLETED
        if (donation.status !== "COMPLETED") {
          console.warn("âš ï¸ Payment not completed. Status:", donation.status);
          if (donation.status === "FAILED") {
            setDonationError("âŒ Payment failed. Please try again.");
          } else if (donation.status === "PENDING") {
            setDonationError("â³ Payment is still pending. Please wait...");
          } else {
            setDonationError("âŒ Payment was not successful.");
          }
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
        console.log("ðŸŽ« Receipt data set from API, showing modal");
        setShowReceipt(true);

        // Clean up storage
        sessionStorage.removeItem("chapaRedirectDonation");
        await loadData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("âŒ Error fetching donation details:", err);
        console.error("Error response:", err.response);
        console.error("Error message:", err.message);

        setDonationError(
          "âŒ Could not verify payment status. Please contact support.",
        );
        sessionStorage.removeItem("chapaRedirectDonation");
      }
    };

    void fetchDonation();

    return () => {
      isCancelled = true;
    };
  }, [location.search, loadData]);

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
        setDonationError(
          "Full Name and Email Address are required for guest donations.",
        );
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      console.log("ðŸ’¾ Stored donation info in sessionStorage:", donationInfo);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm border border-white/20 backdrop-blur-md ${campaign.status === "ACTIVE" ? "bg-emerald-500/80" : "bg-slate-500/80"}`}
          >
            {campaign.status}
          </span>
          <div className="mb-3">
            <CategoryBadge
              category={campaign.category}
              className="bg-white/90"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white md:text-4xl lg:text-5xl">
            {campaign.title}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <RouterLink
                  to={`/charity-profile/${campaign.charity.id}`}
                  className="inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label={`View ${campaign.charity.organizationName} profile`}
                >
                  <img
                    src={
                      resolveAssetUrl(campaign.charity.logo) ||
                      "https://ui-avatars.com/api/?name=C&background=0b2b53&color=fff"
                    }
                    alt={campaign.charity.organizationName}
                    className="h-12 w-12 rounded-full border border-slate-200 shadow-sm"
                  />
                </RouterLink>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[#0b2b53]">
                    <RouterLink
                      to={`/charity-profile/${campaign.charity.id}`}
                      className="transition hover:text-emerald-700"
                    >
                      {campaign.charity.organizationName}
                    </RouterLink>
                    {campaign.charity.verifiedAt && <VerifiedIcon />}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {campaign.charity.description}
                  </p>

                  {/* Social Links */}
                  {(campaign.charity.socialFacebook ||
                    campaign.charity.socialInstagram ||
                    campaign.charity.socialTwitter ||
                    campaign.charity.socialYoutube ||
                    campaign.charity.socialTelegram ||
                    campaign.charity.socialTiktok) && (
                    <div className="mt-3 flex items-center gap-2">
                      {campaign.charity.socialFacebook && (
                        <a
                          href={campaign.charity.socialFacebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Facebook"
                        >
                          <SocialIcon platform="socialFacebook" />
                        </a>
                      )}
                      {campaign.charity.socialInstagram && (
                        <a
                          href={campaign.charity.socialInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          title="Instagram"
                        >
                          <SocialIcon platform="socialInstagram" />
                        </a>
                      )}
                      {campaign.charity.socialTwitter && (
                        <a
                          href={campaign.charity.socialTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-400 transition-colors"
                          title="Twitter"
                        >
                          <SocialIcon platform="socialTwitter" />
                        </a>
                      )}
                      {campaign.charity.socialYoutube && (
                        <a
                          href={campaign.charity.socialYoutube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="YouTube"
                        >
                          <SocialIcon platform="socialYoutube" />
                        </a>
                      )}
                      {campaign.charity.socialTelegram && (
                        <a
                          href={campaign.charity.socialTelegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                          title="Telegram"
                        >
                          <SocialIcon platform="socialTelegram" />
                        </a>
                      )}
                      {campaign.charity.socialTiktok && (
                        <a
                          href={campaign.charity.socialTiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-black transition-colors"
                          title="TikTok"
                        >
                          <SocialIcon platform="socialTiktok" />
                        </a>
                      )}
                    </div>
                  )}
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

            <div className="p-6 pl-0 pr-0">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-3xl font-extrabold text-[#0b2b53]">
                    {formatCurrency(Number(campaign.currentAmount))} ETB
                  </span>
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    raised of {formatCurrency(Number(campaign.targetAmount))}{" "}
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

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 mt-6">
            <span className="font-bold text-slate-700">
              Share this campaign:
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 hover:text-emerald-600 transition-colors shadow-sm"
              title="Copy campaign link"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          {userRole !== "CHARITY" && userRole !== "ADMIN" && (
            <div
              ref={donateSectionRef}
              className="sticky top-24 rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(10,40,80,0.08)] transition-all duration-300"
            >
              <h2 className="mb-6 text-2xl font-extrabold text-[#0b2b53]">
                Make a Donation
              </h2>

              {donationError && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-500">
                  <span>{donationError}</span>
                  <button
                    onClick={() => setDonationError("")}
                    className="text-red-400 hover:text-red-600 focus:outline-none"
                    aria-label="Close error message"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {campaign.status === "CLOSED" ? (
                <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-600 font-bold">
                  This campaign is closed to new donations.
                </div>
              ) : !isLoggedIn || user?.role === "DONOR" ? (
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
                          {formatCurrency(amt)}
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
                        <span>
                          Create Account or Login to track your donation history
                        </span>
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

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        disabled={isLoggedIn}
                        placeholder="Email Address"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

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
                onClick={() => {
                  setShowReceipt(false);
                  setShowReceiptDetails(false);
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors focus:outline-none"
                aria-label="Close receipt"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3 className="text-2xl font-extrabold">Donation Successful!</h3>
              <p className="mt-1 opacity-90">Thank you for your generosity.</p>
            </div>
            <div className="p-8">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Receipt ID</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.receiptReference}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Donor Name</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.isAnonymous
                      ? "Anonymous"
                      : receiptData.donorName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Campaign</span>
                  <span className="font-bold text-[#0b2b53] max-w-[200px] truncate">
                    {receiptData.campaignTitle}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-bold text-[#0b2b53]">
                    {receiptData.paymentMethod || "Chapa Payment"}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-slate-700">
                    Total Donated
                  </span>
                  <span className="text-xl font-extrabold text-emerald-500">
                    {formatCurrency(receiptData.donationAmount, {
                      minFraction: 2,
                      maxFraction: 2,
                    })}{" "}
                    ETB
                  </span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowReceiptDetails(true);
                  }}
                  className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  View Full Receipt
                </button>
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 rounded-xl bg-[#0b2b53] py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceiptDetails && receiptData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                  Full Receipt Data
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-[#0b2b53]">
                  Donation Receipt Details
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptDetails(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close receipt details"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 grid gap-4 px-6 py-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Receipt ID
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {receiptData.receiptReference}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Issued Date
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {formatReadableDate(receiptData.issuedDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Donor Name
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {receiptData.isAnonymous
                    ? "Anonymous"
                    : receiptData.donorName}
                </p>
              </div>
              {!receiptData.isAnonymous && receiptData.donorEmail && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Donor Email
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#0b2b53] break-all">
                    {receiptData.donorEmail}
                  </p>
                </div>
              )}
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Campaign
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {receiptData.campaignTitle}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Charity
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {receiptData.charityName}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Donation Date
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {formatReadableDate(receiptData.donationDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment Status
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b2b53]">
                  {receiptData.paymentStatus}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Total Amount
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  ETB{" "}
                  {formatCurrency(receiptData.donationAmount, {
                    minFraction: 2,
                    maxFraction: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end flex-shrink-0">
              <button
                onClick={() => setShowReceiptDetails(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="rounded-xl bg-[#0b2b53] px-5 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

