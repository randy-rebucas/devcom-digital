import Link from "next/link";

// Visible to every visitor, signed in or not.
export function PublicNavLinks() {
  return (
    <>
      <Link href="/tools" className="text-paper-dim transition-colors hover:text-gold-bright">
        Tools
      </Link>
      <Link href="/projects" className="text-paper-dim transition-colors hover:text-gold-bright">
        Projects
      </Link>
      <Link href="/pricing" className="text-paper-dim transition-colors hover:text-gold-bright">
        Pricing
      </Link>
    </>
  );
}

// Visible only to signed-out visitors.
export function GuestNavLinks() {
  return (
    <>
      <Link href="/login" className="text-paper-dim transition-colors hover:text-gold-bright">
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-sm bg-gold px-4 py-2 font-semibold text-ink transition-colors hover:bg-gold-bright"
      >
        Get started
      </Link>
    </>
  );
}

// Visible only to signed-in users.
export function AuthedNavLinks() {
  return (
    <>
      <Link href="/dashboard" className="text-paper-dim transition-colors hover:text-gold-bright">
        Dashboard
      </Link>
      <Link href="/tools" className="text-paper-dim transition-colors hover:text-gold-bright">
        Tools
      </Link>
      <Link href="/projects" className="text-paper-dim transition-colors hover:text-gold-bright">
        Projects
      </Link>
      <Link href="/requests" className="text-paper-dim transition-colors hover:text-gold-bright">
        Requests
      </Link>
      <Link href="/profile" className="text-paper-dim transition-colors hover:text-gold-bright">
        Profile
      </Link>
    </>
  );
}
