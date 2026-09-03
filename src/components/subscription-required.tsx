import { ButtonLink } from "@/components/ui/button";

export function SubscriptionRequired() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
          Subscription required
        </h1>
        <p className="mt-2 text-paper-dim">
          A valid license key is needed to access the tools suite.
        </p>
        <ButtonLink href="/pricing" size="lg" className="mt-6">
          Subscribe now
        </ButtonLink>
      </div>
    </main>
  );
}
