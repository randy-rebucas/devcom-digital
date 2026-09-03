import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Access your Devcom Digital dashboard and license key.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            No account yet?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
