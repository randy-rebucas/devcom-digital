import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">{children}</main>
    </>
  );
}
