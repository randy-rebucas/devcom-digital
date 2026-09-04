"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotation } from "@/lib/ai/quote";
import { sendQuoteReadyEmail } from "@/lib/mail";
import {
  checkCreateRateLimit,
  checkRegenerateRateLimit,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "@/lib/ai/rate-limit";
import type { QuoteRequestKind } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

export type QuoteRequestFormState = { error?: string } | undefined;

export async function createQuoteRequest(
  _prevState: QuoteRequestFormState,
  formData: FormData,
): Promise<QuoteRequestFormState> {
  const session = await requireUser();

  const kind = String(formData.get("kind") ?? "CUSTOM") as QuoteRequestKind;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const toolId = kind === "TOOL" ? String(formData.get("toolId") ?? "").trim() || null : null;
  const projectId = kind === "PROJECT" ? String(formData.get("projectId") ?? "").trim() || null : null;

  if (!title || !description) {
    return { error: "Title and description are required." };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` };
  }
  if (kind === "TOOL" && !toolId) {
    return { error: "Please select a tool." };
  }
  if (kind === "PROJECT" && !projectId) {
    return { error: "Please select a project." };
  }

  const rateLimit = await checkCreateRateLimit(session.user.id);
  if (!rateLimit.ok) {
    return { error: rateLimit.error };
  }

  let contextLabel: string | undefined;
  if (toolId) {
    const tool = await prisma.tool.findUnique({ where: { id: toolId }, select: { name: true, desc: true } });
    if (tool) contextLabel = `Tool "${tool.name}": ${tool.desc}`;
  } else if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true, desc: true } });
    if (project) contextLabel = `Project "${project.name}": ${project.desc}`;
  }

  const created = await prisma.quoteRequest.create({
    data: {
      userId: session.user.id,
      kind,
      toolId,
      projectId,
      title,
      description,
      status: "PENDING",
    },
  });

  const result = await generateQuotation({ title, description, contextLabel });

  if (result.ok) {
    await prisma.quoteRequest.update({
      where: { id: created.id },
      data: {
        status: "QUOTED",
        pipelineStage: "QUOTED",
        quoteSummary: result.summary,
        quoteScope: result.scope,
        quoteTimeline: result.timeline,
        quoteEstimate: result.priceRange,
        quoteRaw: result.raw,
        quotedAt: new Date(),
      },
    });
    try {
      await sendQuoteReadyEmail(session.user.email!, session.user.name ?? "there", created.id, title);
    } catch (err) {
      console.error("Failed to send quote ready email", err);
    }
  } else {
    await prisma.quoteRequest.update({
      where: { id: created.id },
      data: {
        status: "FAILED",
        errorMessage: result.error,
        quoteRaw: result.raw,
      },
    });
  }

  revalidatePath("/requests");
  redirect(`/requests/${created.id}`);
}

export async function regenerateQuote(
  id: string,
  _prevState: QuoteRequestFormState,
  formData: FormData,
): Promise<QuoteRequestFormState> {
  const session = await requireUser();

  const request = await prisma.quoteRequest.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!request) redirect("/requests");

  const rateLimit = checkRegenerateRateLimit(request);
  if (!rateLimit.ok) {
    return { error: rateLimit.error };
  }

  const additionalNotes = String(formData.get("additionalNotes") ?? "").trim().slice(0, MAX_DESCRIPTION_LENGTH);
  const description = additionalNotes
    ? `${request.description}\n\nAdditional notes from member: ${additionalNotes}`
    : request.description;

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` };
  }

  let contextLabel: string | undefined;
  if (request.toolId) {
    const tool = await prisma.tool.findUnique({ where: { id: request.toolId }, select: { name: true, desc: true } });
    if (tool) contextLabel = `Tool "${tool.name}": ${tool.desc}`;
  } else if (request.projectId) {
    const project = await prisma.project.findUnique({ where: { id: request.projectId }, select: { name: true, desc: true } });
    if (project) contextLabel = `Project "${project.name}": ${project.desc}`;
  }

  const result = await generateQuotation({ title: request.title, description, contextLabel });

  if (result.ok) {
    await prisma.quoteRequest.update({
      where: { id },
      data: {
        description,
        status: "QUOTED",
        pipelineStage: "QUOTED",
        quoteSummary: result.summary,
        quoteScope: result.scope,
        quoteTimeline: result.timeline,
        quoteEstimate: result.priceRange,
        quoteRaw: result.raw,
        quotedAt: new Date(),
        errorMessage: null,
        regenerationCount: { increment: 1 },
      },
    });
    try {
      await sendQuoteReadyEmail(session.user.email!, session.user.name ?? "there", id, request.title);
    } catch (err) {
      console.error("Failed to send quote ready email", err);
    }
  } else {
    await prisma.quoteRequest.update({
      where: { id },
      data: {
        description,
        status: "FAILED",
        errorMessage: result.error,
        quoteRaw: result.raw,
        regenerationCount: { increment: 1 },
      },
    });
  }

  revalidatePath(`/requests/${id}`);
  revalidatePath("/requests");
  return undefined;
}

export async function decideQuoteRequest(id: string, decision: "ACCEPTED" | "DECLINED") {
  const session = await requireUser();

  const request = await prisma.quoteRequest.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!request) redirect("/requests");

  await prisma.quoteRequest.update({
    where: { id },
    data: {
      status: decision,
      ...(decision === "ACCEPTED" ? { pipelineStage: "NEGOTIATING" as const } : {}),
    },
  });

  revalidatePath(`/requests/${id}`);
  revalidatePath("/requests");
}
