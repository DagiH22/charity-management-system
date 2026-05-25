import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  TrendingUp,
  Shield,
  Eye,
  Search,
  CreditCard,
  BarChart3,
  Handshake,
  ChevronRight,
  Quote,
  Sparkles,
} from "lucide-react";
import CampaignCard from "../components/CampaignCard";
import Footer from "../components/Footer";
import type { Campaign } from "../types/campaign";
import {
  getFeaturedCampaigns,
  getPlatformStats,
} from "../services/campaign.api";
import type { PlatformStats } from "../services/campaign.api";

/* ════════════════════════════════════════
   Static data
   ════════════════════════════════════════ */

const howItWorks = [
  {
    step: "01",
    icon: Search,
    title: "Discover Campaigns",
    description:
      "Browse verified causes, learn each story, and choose the campaign that speaks to you most.",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Donate Securely",
    description:
      "Make a donation with confidence through a simple, transparent, and secure giving experience.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Track Impact",
    description:
      "Follow campaign progress in real time and watch your support turn into measurable results.",
  },
  {
    step: "04",
    icon: Handshake,
    title: "Help Communities",
    description:
      "See the difference your generosity makes as communities grow, heal, and thrive together.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Transparent Donations",
    description:
      "Every transaction is tracked and visible. Know exactly where your money goes and how it's used.",
  },
  {
    icon: Heart,
    title: "Trusted Platform",
    description:
      "We verify every charity and campaign to ensure your donations reach people who need help most.",
  },
  {
    icon: Users,
    title: "Community Impact",
    description:
      "Join thousands of donors creating lasting change in education, healthcare, and livelihoods.",
  },
  {
    icon: Eye,
    title: "Real-Time Tracking",
    description:
      "Monitor campaign progress, receive updates, and follow the impact of your contributions live.",
  },
];

const testimonials = [
  {
    quote:
      "CharityHub made it incredibly easy to find a cause I care about and contribute. I can actually see where my donation goes — that transparency is everything.",
    name: "Abebe Kebede",
    role: "Regular Donor",
    avatar: "AK",
  },
  {
    quote:
      "As a small charity, this platform gave us the visibility we needed. We raised 3x more than we expected for our clean water project.",
    name: "Sara Mengistu",
    role: "Charity Organizer",
    avatar: "SM",
  },
  {
    quote:
      "I love how I can follow campaigns and get updates. It feels personal — like I'm truly part of the mission, not just sending money.",
    name: "Daniel Hailu",
    role: "Monthly Contributor",
    avatar: "DH",
  },
];

/* ════════════════════════════════════════
   Skeleton components
   ════════════════════════════════════════ */

function StatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-5 backdrop-blur-sm">
      <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
      <div className="h-4 w-20 rounded skeleton-shimmer" />
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-40 w-full rounded-xl skeleton-shimmer" />
      <div className="mb-3 h-6 w-3/4 rounded-lg skeleton-shimmer" />
      <div className="mb-2 h-4 w-full rounded skeleton-shimmer" />
      <div className="mb-6 h-4 w-2/3 rounded skeleton-shimmer" />
      <div className="mb-4 h-3 w-full rounded-full skeleton-shimmer" />
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="h-9 w-28 rounded-xl skeleton-shimmer" />
        <div className="h-4 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Formatting helpers
   ════════════════════════════════════════ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ETB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K ETB`;
  return `${n.toLocaleString()} ETB`;
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */

const HomePage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const data = await getFeaturedCampaigns();
        setCampaigns(data.data);
      } catch (error: any) {
        setCampaignError(
          error.response?.data?.message || "Failed to fetch campaigns.",
        );
      } finally {
        setLoadingCampaigns(false);
      }
    };

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await getPlatformStats();
        setStats(data.data);
      } catch {
        // Stats are non-critical — fail silently
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCampaigns();
    fetchStats();
  }, []);

  const scrollToAbout = () => {
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071e3d] via-[#0b2b53] to-[#0e3668]">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 blur-[80px]" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-[6vw] pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-semibold text-emerald-300">
                Making a Difference Together
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up stagger-1 mt-8 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Empower Communities,{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Transform Lives
              </span>
            </h1>

            {/* Description */}
            <p className="animate-fade-in-up stagger-2 mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Join a trusted platform where your generosity directly funds
              verified campaigns, supports families, empowers education, and
              creates lasting impact in communities that need it most.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/campaigns"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(14,204,110,0.3)] transition hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_18px_36px_rgba(14,204,110,0.35)]"
              >
                <Heart className="h-4 w-4" />
                Explore Campaigns
              </Link>
              <button
                onClick={scrollToAbout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
              >
                Learn More
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="animate-fade-in-up stagger-4 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {loadingStats ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : stats ? (
              <>
                <div className="animate-count-up stagger-1 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/10">
                  <TrendingUp className="mb-1 h-5 w-5 text-emerald-400" />
                  <span className="text-2xl font-extrabold text-white sm:text-3xl">
                    {formatCurrency(stats.totalDonations)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Total Donations
                  </span>
                </div>
                <div className="animate-count-up stagger-2 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/10">
                  <Heart className="mb-1 h-5 w-5 text-emerald-400" />
                  <span className="text-2xl font-extrabold text-white sm:text-3xl">
                    {formatNumber(stats.activeCampaigns)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Active Campaigns
                  </span>
                </div>
                <div className="animate-count-up stagger-3 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/10">
                  <Users className="mb-1 h-5 w-5 text-emerald-400" />
                  <span className="text-2xl font-extrabold text-white sm:text-3xl">
                    {formatNumber(stats.peopleHelped)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    People Helped
                  </span>
                </div>
                <div className="animate-count-up stagger-4 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/10">
                  <Handshake className="mb-1 h-5 w-5 text-emerald-400" />
                  <span className="text-2xl font-extrabold text-white sm:text-3xl">
                    {formatNumber(stats.totalDonors)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Total Donors
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED CAMPAIGNS ═══════════ */}
      <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7fd_100%)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-[6vw]">
          <div className="relative">
            {/* Background blurs */}
            <div className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
                Featured Campaigns
              </p>
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-[#0b2b53] sm:text-[2.2rem]">
                    Support causes that matter the most
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                    Explore a few urgent campaigns and help us turn generosity
                    into real, measurable change.
                  </p>
                </div>
                <Link
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0b2b53] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  to="/campaigns"
                >
                  View All Campaigns
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Campaign Grid */}
              <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {loadingCampaigns ? (
                  <>
                    <CampaignCardSkeleton />
                    <CampaignCardSkeleton />
                    <CampaignCardSkeleton />
                  </>
                ) : campaignError ? (
                  <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
                    <p className="text-red-600">{campaignError}</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                    <Heart className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-lg font-semibold text-slate-700">
                      No campaigns yet
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Check back soon — new campaigns are being added
                      regularly.
                    </p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="animate-fade-in-up transition-transform hover:-translate-y-1"
                    >
                      <CampaignCard campaign={campaign} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT US ═══════════ */}
      <section id="about" className="scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-[6vw]">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
              About CharityHub
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-[#0b2b53] sm:text-4xl">
              A simple platform built to connect generosity with real needs
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              CharityHub helps people discover meaningful causes, support trusted
              campaigns, and follow the difference their contributions make in
              communities that need it most.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">
                Mission
              </p>
              <h3 className="mt-4 text-xl font-extrabold text-[#0b2b53]">
                Make giving more direct and more human.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Our mission is to make it easier for donors to support urgent
                campaigns while giving organizations a clearer way to share
                their needs and progress.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm transition hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">
                Vision
              </p>
              <h3 className="mt-4 text-xl font-extrabold text-[#0b2b53]">
                Build a future where help reaches people faster.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                We imagine a world where technology removes friction from
                kindness, helping communities access funding, resources, and
                hope without delay.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`animate-fade-in-up stagger-${idx + 1} group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg`}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0b2b53]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7fd_100%)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-[6vw]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-[#0b2b53] sm:text-4xl">
              From discovery to impact in four clear steps
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, idx) => (
              <div
                key={step.step}
                className={`animate-fade-in-up stagger-${idx + 1} group relative rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Step number */}
                <div className="inline-flex rounded-full bg-[#0b2b53] px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                  {step.step}
                </div>
                {/* Icon */}
                <div className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#0b2b53]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
                {/* Connector line (hidden on last) */}
                {idx < howItWorks.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-12 hidden h-0.5 w-6 bg-emerald-200 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-[6vw]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
              Impact Stories
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-[#0b2b53] sm:text-4xl">
              Hear from our community
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Real stories from donors and organizers who are making a
              difference through CharityHub.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={testimonial.name}
                className={`animate-fade-in-up stagger-${idx + 1} group rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <Quote className="h-8 w-8 text-emerald-200 transition group-hover:text-emerald-400" />
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b2b53] text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0b2b53]">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-[6vw]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2b53] via-[#0e3668] to-[#122e52] px-8 py-16 text-center shadow-[0_30px_60px_rgba(10,40,80,0.2)] sm:px-12 lg:px-20 lg:py-20">
            {/* Background decorations */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-60 w-60 rounded-full bg-sky-500/15 blur-[70px]" />

            <div className="relative">
              <Sparkles className="mx-auto h-8 w-8 text-emerald-400" />
              <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Ready to make a{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  difference
                </span>
                ?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Every donation, no matter how small, brings hope to someone in
                need. Start your journey of impact today.
              </p>
              <div className="mt-10">
                <Link
                  to="/campaigns"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-10 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(14,204,110,0.3)] transition hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_20px_40px_rgba(14,204,110,0.35)]"
                >
                  <Heart className="h-5 w-5" />
                  Start Donating
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
