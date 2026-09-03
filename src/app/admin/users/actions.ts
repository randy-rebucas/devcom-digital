"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");

  if (session!.user.id === userId && role !== "ADMIN") {
    return;
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}
