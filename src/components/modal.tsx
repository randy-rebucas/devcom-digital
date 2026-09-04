"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) router.back();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-10 backdrop-blur-sm sm:items-center"
    >
      <div className="relative w-full max-w-2xl border border-hairline bg-ink shadow-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-sm border border-hairline bg-ink/80 text-paper-dim transition-colors hover:text-gold-bright"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
