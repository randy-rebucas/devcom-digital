"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Admin overview" },
  { href: "/admin/tools", label: "Manage tools" },
  { href: "/admin/projects", label: "Manage projects" },
  { href: "/admin/users", label: "Manage users" },
];

export function MobileNav({
  isAuthed,
  isAdmin,
}: {
  isAuthed: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-sm text-paper hover:bg-ink-raised"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
          {open ? (
            <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" />
          ) : (
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          )}
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 top-full z-10 border-b border-hairline bg-ink px-6 py-4 shadow-lg"
        >
          <nav className="flex flex-col gap-1 text-sm">
            {isAuthed ? (
              <>
                <MobileLink href="/dashboard">Dashboard</MobileLink>
                <MobileLink href="/tools">Tools</MobileLink>
                <MobileLink href="/projects">Projects</MobileLink>
                <MobileLink href="/profile">Profile</MobileLink>
                {isAdmin && (
                  <>
                    <div className="mt-2 border-t border-hairline pt-2" />
                    {ADMIN_LINKS.map((link) => (
                      <MobileLink key={link.href} href={link.href}>
                        {link.label}
                      </MobileLink>
                    ))}
                  </>
                )}
                <button
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="rounded-sm px-2 py-2 text-left text-paper-dim hover:bg-ink-raised hover:text-paper"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/tools">Tools</MobileLink>
                <MobileLink href="/projects">Projects</MobileLink>
                <MobileLink href="/pricing">Pricing</MobileLink>
                <MobileLink href="/login">Log in</MobileLink>
                <Link
                  href="/register"
                  className="mt-1 rounded-sm bg-gold px-3 py-2 text-center font-semibold text-ink hover:bg-gold-bright"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm px-2 py-2 text-paper-dim hover:bg-ink-raised hover:text-paper"
    >
      {children}
    </Link>
  );
}
