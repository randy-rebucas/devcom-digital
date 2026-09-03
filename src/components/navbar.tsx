import { auth, signOut } from "@/lib/auth";
import { AdminMenu } from "@/components/admin-menu";
import { LogoMark } from "@/components/logo-mark";
import { MobileNav } from "@/components/mobile-nav";
import { PublicNavLinks, GuestNavLinks, AuthedNavLinks } from "@/components/nav-links";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="relative border-b border-hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-paper"
        >
          <LogoMark className="h-7 w-7 shrink-0" />
          DEVCOM<span className="text-gold">DIGITAL</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm sm:flex">
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
                <button className="text-paper-dim transition-colors hover:text-gold-bright">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <PublicNavLinks />
              <GuestNavLinks />
            </>
          )}
        </nav>
        <MobileNav
          isAuthed={Boolean(session?.user)}
          isAdmin={session?.user?.role === "ADMIN"}
        />
      </div>
    </header>
  );
}
