import Link from "next/link";

// Visible to every visitor, signed in or not.
export function PublicNavLinks() {
  return (
    <Link href="/pricing" className="hover:text-indigo-600">
      Pricing
    </Link>
  );
}

// Visible only to signed-out visitors.
export function GuestNavLinks() {
  return (
    <>
      <Link href="/login" className="hover:text-indigo-600">
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
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
      <Link href="/dashboard" className="hover:text-indigo-600">
        Dashboard
      </Link>
      <Link href="/tools" className="hover:text-indigo-600">
        Tools
      </Link>
    </>
  );
}
