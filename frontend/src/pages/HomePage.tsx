const HomePage = () => {
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-[6vw] py-12 lg:flex-row lg:items-start lg:py-20">
      <div className="flex-1">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
          Charity Helps
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[#0b2b53] sm:text-5xl lg:text-6xl">
          Our Helping To
          <br />
          The World.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          We believe every small act of kindness can change a life. Join us as
          we support families, empower communities, and create lasting impact
          together.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-[0_12px_20px_rgba(14,204,110,0.25)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_24px_rgba(14,204,110,0.32)]">
            Get Started
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-[#0b2b53] shadow-sm transition hover:border-emerald-300">
            Learn More
          </button>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center lg:justify-end">
        <div className="relative h-64 w-64 overflow-hidden rounded-full border-[10px] border-emerald-400/90 bg-white shadow-[0_20px_40px_rgba(10,40,80,0.12)] sm:h-80 sm:w-80 lg:h-[420px] lg:w-[420px]">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Students smiling in a classroom"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_rgba(148,163,184,0.08),_transparent_70%)]" />
        </div>
      </div>
    </section>
  );
};

export default HomePage;
