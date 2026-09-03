import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Devcom Digital account to view your license key and tools.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Log in
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Access your Devcom Digital dashboard and license key.
          </p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-sm text-paper-dim">
            No account yet?{" "}
            <Link href="/register" className="text-gold hover:text-gold-bright">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
