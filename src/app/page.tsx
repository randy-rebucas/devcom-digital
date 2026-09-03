import Link from "next/link";
import { Navbar } from "@/components/navbar";

const FEATURES = [
  {
    title: "SEO & Keyword Toolkit",
    desc: "Track rankings, audit on-page SEO, and surface keyword opportunities.",
  },
  {
    title: "Social Content Scheduler",
    desc: "Plan and queue posts across platforms from a single calendar.",
  },
  {
    title: "Campaign Analytics",
    desc: "Unified dashboards for ad spend, conversions, and ROI reporting.",
  },
  {
    title: "Ad Creative Generator",
    desc: "Produce on-brand ad copy and creative variants in seconds.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Digital marketing tools,
            <br />
            <span className="text-indigo-600">unlocked by subscription.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Devcom Digital Marketing Services builds the tools growing
            businesses use to plan, launch, and measure their marketing.
            Subscribe once, get a personal license key, and unlock the full
            suite.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
            >
              View pricing
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-neutral-300 px-6 py-3 font-medium hover:border-indigo-600 hover:text-indigo-600 dark:border-neutral-700"
            >
              Create an account
            </Link>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-semibold">
              What&apos;s inside the suite
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl font-semibold">How access works</h2>
            <ol className="mt-8 space-y-6 text-left">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  1
                </span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Create a free account and choose the subscription plan.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  2
                </span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Pay securely with PayPal &mdash; billed on a recurring
                  schedule.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  3
                </span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  We generate a unique license key tied to your account and
                  unlock the tools dashboard.
                </p>
              </li>
            </ol>
          </div>
        </section>
      </main>
      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800">
        © {new Date().getFullYear()} Devcom Digital Marketing Services.
      </footer>
    </>
  );
}
