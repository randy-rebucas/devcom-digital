import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { updateUserRole } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { subscription: true },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Back to admin
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {users.length} user{users.length === 1 ? "" : "s"}
          </p>

          <div className="mt-8 space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name ?? user.email}</p>
                  <p className="truncate text-sm text-neutral-500">{user.email}</p>
                </div>
                <form
                  action={async (formData) => {
                    "use server";
                    const role = formData.get("role") as "ADMIN" | "MEMBER";
                    await updateUserRole(user.id, role);
                  }}
                  className="flex shrink-0 items-center gap-2"
                >
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    disabled={user.id === session!.user.id}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={user.id === session!.user.id}
                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
