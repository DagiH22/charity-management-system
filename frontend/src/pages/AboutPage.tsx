import Footer from "../components/Footer";

const steps = [
  {
    number: "01",
    title: "Discover campaigns",
    description:
      "Browse causes, learn each story, and choose the campaign that speaks to you most.",
  },
  {
    number: "02",
    title: "Contribute securely",
    description:
      "Make a donation with confidence through a simple, transparent giving experience.",
  },
  {
    number: "03",
    title: "See the impact",
    description:
      "Follow campaign progress and watch your support turn into real help for communities.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-[1200px] px-[6vw]">
        <div className="overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7fd_100%)] ">
          <div className="px-6 py-4 sm:px-8 lg:px-12 lg:py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
              About CharityApp
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.02em] text-[#0b2b53] sm:text-5xl">
              A simple platform built to connect generosity with real needs.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              CharityApp helps people discover meaningful causes, support trusted
              campaigns, and follow the difference their contributions make in
              communities that need it most.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="px-6 py-8 sm:px-8 lg:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">
                Mission
              </p>
              <h2 className="mt-4 text-2xl font-extrabold text-[#0b2b53]">
                Make giving more direct and more human.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Our mission is to make it easier for donors to support urgent
                campaigns while giving organizations a clearer way to share their
                needs and progress.
              </p>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">
                Vision
              </p>
              <h2 className="mt-4 text-2xl font-extrabold text-[#0b2b53]">
                Build a future where help reaches people faster.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                We imagine a world where technology removes friction from
                kindness, helping communities access funding, resources, and hope
                without delay.
              </p>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-[#0b2b53]">
                From discovery to impact in three clear steps
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="bg-[#f7fbff] p-6 shadow-[0_14px_30px_rgba(10,40,80,0.04)]"
                >
                  <div className="inline-flex rounded-full bg-[#0b2b53] px-4 py-1.5 text-sm font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-[#0b2b53]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
