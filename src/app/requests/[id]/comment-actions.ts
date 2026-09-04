"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewCommentEmail } from "@/lib/mail";

const MAX_COMMENT_LENGTH = 2000;

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export type CommentFormState = { error?: string } | undefined;

export async function postComment(
  quoteRequestId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await requireUser();

  const request = await prisma.quoteRequest.findFirst({
    where: { id: quoteRequestId, userId: session.user.id },
  });
  if (!request) redirect("/requests");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message can't be empty." };
  if (body.length > MAX_COMMENT_LENGTH) {
    return { error: `Message must be ${MAX_COMMENT_LENGTH} characters or fewer.` };
  }

  await prisma.comment.create({
    data: {
      quoteRequestId,
      authorId: session.user.id,
      authorType: "MEMBER",
      body,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, name: true } });
  await Promise.all(
    admins.map((admin) =>
      sendNewCommentEmail(
        admin.email,
        admin.name ?? "there",
        quoteRequestId,
        request.title,
        session.user.name ?? "A member",
      ).catch((err) => console.error("Failed to send new comment email", err)),
    ),
  );

  revalidatePath(`/requests/${quoteRequestId}`);
  return undefined;
}
