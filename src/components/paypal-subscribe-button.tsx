"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ButtonLink } from "@/components/ui/button";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (selector: HTMLElement) => void;
      };
    };
  }
}

export function PaypalSubscribeButton({
  planId,
  clientId,
  isLoggedIn,
}: {
  planId: string;
  clientId: string;
  isLoggedIn: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const renderButtons = useCallback(() => {
    if (!window.paypal || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    window.paypal
      .Buttons({
        style: { shape: "pill", color: "black", layout: "vertical" },
        createSubscription: (
          _data: unknown,
          actions: { subscription: { create: (opts: unknown) => Promise<string> } }
        ) => actions.subscription.create({ plan_id: planId }),
        onApprove: async (data: { subscriptionID: string }) => {
          setStatus("processing");
          const res = await fetch("/api/paypal/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: data.subscriptionID }),
          });
          if (!res.ok) {
            setStatus("error");
            return;
          }
          setStatus("success");
          router.push("/dashboard");
          router.refresh();
        },
        onError: () => setStatus("error"),
      })
      .render(containerRef.current);
  }, [clientId, planId, router]);

  if (!isLoggedIn) {
    return (
      <ButtonLink href="/register" className="w-full">
        Create an account to subscribe
      </ButtonLink>
    );
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`}
        strategy="lazyOnload"
        onReady={renderButtons}
      />
      <div ref={containerRef} />
      {status === "processing" && (
        <p className="mt-2 text-sm text-paper-dim">Activating your subscription…</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">
          Something went wrong confirming your subscription. Please try again.
        </p>
      )}
    </div>
  );
}
