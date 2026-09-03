import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ToolStatusBadge } from "@/components/tool-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { listEnabledTools, stripMarkdown } from "@/lib/tools";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    desc: "Register with an email and choose the subscription plan.",
  },
  {
    n: "02",
    title: "Pay securely with PayPal",
    desc: "Billed on a recurring schedule — cancel anytime from PayPal.",
  },
  {
    n: "03",
    title: "Get your credential",
    desc: "A license key is issued to your account and every tool in the suite lights up.",
  },
];

export default async function Home() {
  const tools = await listEnabledTools();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-paper sm:text-7xl">
            Every marketing tool.
            <br />
            <span className="text-gold">One credential.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper-dim">
            One subscription, one license key, the whole Devcom Digital suite.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/pricing" size="lg">
              View pricing
            </ButtonLink>
            <ButtonLink href="/register" variant="secondary" size="lg">
              Create an account
            </ButtonLink>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                The suite
              </h2>
              <span className="font-mono text-sm text-paper-dim tabular-nums">
                {tools.length.toString().padStart(2, "0")} tool
                {tools.length === 1 ? "" : "s"}
              </span>
            </div>

            {tools.length === 0 ? (
              <p className="mt-10 border-t border-hairline pt-8 text-paper-dim">
                The suite is being assembled — check back soon.
              </p>
            ) : (
              <ul className="mt-8 grid grid-cols-1 border-l border-t border-hairline sm:grid-cols-2">
                {tools.map((tool, i) => (
                  <li key={tool.slug} className="border-b border-r border-hairline">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-ink-raised"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs text-gold-dim">
                          No. {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <ToolStatusBadge status={tool.status} className="shrink-0" />
                      </div>
                      <h3 className="font-display text-xl font-bold tracking-tight text-paper group-hover:text-gold-bright">
                        {tool.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-paper-dim">
                        {stripMarkdown(tool.desc)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
              How access works
            </h2>

            <div className="relative mt-16">
              <div
                aria-hidden="true"
                className="absolute top-5 hidden h-px bg-hairline sm:block sm:left-[16.6667%] sm:right-[16.6667%]"
              />
              <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                {STEPS.map((step, i) => {
                  const isLast = i === STEPS.length - 1;
                  return (
                    <li key={step.n} className="flex gap-5 sm:flex-col sm:gap-0">
                      <span
                        className={
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm sm:mx-auto " +
                          (isLast
                            ? "border-gold-bright bg-gold text-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--gold-bright)_18%,transparent),0_0_16px_2px_color-mix(in_srgb,var(--gold-bright)_45%,transparent)]"
                            : "border-hairline bg-ink text-paper-dim")
                        }
                      >
                        {step.n}
                      </span>
                      <div className="sm:mt-5 sm:text-center">
                        <h3 className="font-medium text-paper">{step.title}</h3>
                        <p className="mt-1 max-w-xs text-sm leading-relaxed text-paper-dim sm:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
