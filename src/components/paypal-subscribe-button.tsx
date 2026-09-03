"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!containerRef.current) return;

    const scriptId = "paypal-sdk";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    function renderButtons() {
      if (!window.paypal || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          style: { shape: "pill", color: "blue", layout: "vertical" },
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
    }

    if (existing) {
      renderButtons();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = renderButtons;
    document.body.appendChild(script);
  }, [clientId, planId, isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <a
        href="/register"
        className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-500"
      >
        Create an account to subscribe
      </a>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {status === "processing" && (
        <p className="mt-2 text-sm text-neutral-500">Activating your subscription…</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Something went wrong confirming your subscription. Please try again.
        </p>
      )}
    </div>
  );
}
