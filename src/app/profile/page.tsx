import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvatarForm } from "./avatar-form";
import { ProfileInfoForm } from "./profile-info-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, password: true },
  });
  if (!user) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-paper">
            Your profile
          </h1>

          <div className="mt-10 border-t border-hairline">
            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Avatar
              </h2>
              <AvatarForm image={user.image} name={user.name} />
            </section>

            <section className="border-b border-hairline py-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                Profile information
              </h2>
              <ProfileInfoForm name={user.name} email={user.email} />
            </section>

            {user.password && (
              <section className="border-b border-hairline py-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">
                  Change password
                </h2>
                <ChangePasswordForm />
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
