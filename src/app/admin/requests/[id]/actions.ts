"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { sendDeliverableUploadedEmail, sendNewCommentEmail, sendStatusChangeEmail } from "@/lib/mail";
import type { PipelineStage } from "@prisma/client";

const MAX_DELIVERABLE_BYTES = 25 * 1024 * 1024;

const MAX_NOTE_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 2000;

async function requireAdmin() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/tools");
  return session!;
}

export async function updateAdminPipeline(id: string, stage: PipelineStage) {
  await requireAdmin();

  const request = await prisma.quoteRequest.update({
    where: { id },
    data: { pipelineStage: stage },
    include: { user: { select: { email: true, name: true } } },
  });

  if (stage === "WON" || stage === "LOST") {
    try {
      await sendStatusChangeEmail(
        request.user.email,
        request.user.name ?? "there",
        id,
        request.title,
        stage,
      );
    } catch (err) {
      console.error("Failed to send status change email", err);
    }
  }

  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin/requests");
}

export async function setFollowUp(id: string, date: string | null) {
  await requireAdmin();

  await prisma.quoteRequest.update({
    where: { id },
    data: { followUpAt: date ? new Date(date) : null },
  });

  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin/requests");
}

export type NoteFormState = { error?: string } | undefined;

export async function addAdminNote(
  quoteRequestId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const session = await requireAdmin();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Note can't be empty." };
  if (body.length > MAX_NOTE_LENGTH) {
    return { error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.` };
  }

  await prisma.note.create({
    data: { quoteRequestId, authorId: session.user.id, body },
  });

  revalidatePath(`/admin/requests/${quoteRequestId}`);
  return undefined;
}

export type AdminCommentFormState = { error?: string } | undefined;

export async function postAdminComment(
  quoteRequestId: string,
  _prevState: AdminCommentFormState,
  formData: FormData,
): Promise<AdminCommentFormState> {
  const session = await requireAdmin();

  const request = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!request) redirect("/admin/requests");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message can't be empty." };
  if (body.length > MAX_COMMENT_LENGTH) {
    return { error: `Message must be ${MAX_COMMENT_LENGTH} characters or fewer.` };
  }

  await prisma.comment.create({
    data: {
      quoteRequestId,
      authorId: session.user.id,
      authorType: "ADMIN",
      body,
    },
  });

  try {
    await sendNewCommentEmail(
      request.user.email,
      request.user.name ?? "there",
      quoteRequestId,
      request.title,
      "Devcom Digital",
    );
  } catch (err) {
    console.error("Failed to send new comment email", err);
  }

  revalidatePath(`/admin/requests/${quoteRequestId}`);
  revalidatePath(`/requests/${quoteRequestId}`);
  return undefined;
}

export type DeliverableFormState = { error?: string } | undefined;

export async function uploadDeliverable(
  quoteRequestId: string,
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  const session = await requireAdmin();

  const request = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!request) redirect("/admin/requests");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_DELIVERABLE_BYTES) {
    return { error: "File must be 25MB or smaller." };
  }

  const filename = `requests/${quoteRequestId}/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  await prisma.deliverable.create({
    data: {
      quoteRequestId,
      name: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      uploadedById: session.user.id,
    },
  });

  try {
    await sendDeliverableUploadedEmail(
      request.user.email,
      request.user.name ?? "there",
      quoteRequestId,
      request.title,
      file.name,
    );
  } catch (err) {
    console.error("Failed to send deliverable uploaded email", err);
  }

  revalidatePath(`/admin/requests/${quoteRequestId}`);
  revalidatePath(`/requests/${quoteRequestId}`);
  return undefined;
}
