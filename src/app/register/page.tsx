import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Then subscribe to get your license key.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
          <p className="mt-6 text-sm text-paper-dim">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-bright">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
