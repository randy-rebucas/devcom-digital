import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserRole } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { subscription: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin" className="text-sm text-paper-dim hover:text-gold-bright">
        ← Back to admin
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper">
        Users
      </h1>
      <p className="mt-1 text-sm text-paper-dim">
        {users.length} user{users.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-8 border-t border-hairline">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between gap-4 border-b border-hairline py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-paper">{user.name ?? user.email}</p>
              <p className="truncate text-sm text-paper-dim">{user.email}</p>
            </div>
            <form
              action={async (formData) => {
                "use server";
                const role = formData.get("role") as "ADMIN" | "MEMBER";
                await updateUserRole(user.id, role);
              }}
              className="flex shrink-0 items-center gap-2"
            >
              <Select
                name="role"
                defaultValue={user.role}
                disabled={user.id === session!.user.id}
                containerClassName="w-32"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Button type="submit" size="sm" disabled={user.id === session!.user.id}>
                Save
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
