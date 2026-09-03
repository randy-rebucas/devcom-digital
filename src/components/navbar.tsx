import { auth, signOut } from "@/lib/auth";
import { AdminMenu } from "@/components/admin-menu";
import { PublicNavLinks, GuestNavLinks, AuthedNavLinks } from "@/components/nav-links";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Devcom<span className="text-indigo-600">Digital</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {session?.user ? (
            <>
              <AuthedNavLinks />
              {session.user.role === "ADMIN" && <AdminMenu />}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="hover:text-indigo-600">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <PublicNavLinks />
              <GuestNavLinks />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
