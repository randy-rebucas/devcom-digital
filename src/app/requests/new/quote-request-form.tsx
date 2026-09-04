"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createQuoteRequest, type QuoteRequestFormState } from "../actions";

type CatalogItem = { id: string; name: string };

export function QuoteRequestForm({
  tools,
  projects,
  maxTitleLength,
  maxDescriptionLength,
}: {
  tools: CatalogItem[];
  projects: CatalogItem[];
  maxTitleLength: number;
  maxDescriptionLength: number;
}) {
  const [state, formAction, pending] = useActionState<QuoteRequestFormState, FormData>(
    createQuoteRequest,
    undefined,
  );
  const [kind, setKind] = useState<"CUSTOM" | "TOOL" | "PROJECT">("CUSTOM");

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <Field label="What is this request for?" htmlFor="kind">
        <Select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
        >
          <option value="CUSTOM">A custom idea</option>
          <option value="TOOL">An existing tool</option>
          <option value="PROJECT">An existing project</option>
        </Select>
      </Field>

      {kind === "TOOL" && (
        <Field label="Tool" htmlFor="toolId">
          <Select id="toolId" name="toolId" defaultValue="">
            <option value="" disabled>
              Select a tool…
            </option>
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {kind === "PROJECT" && (
        <Field label="Project" htmlFor="projectId">
          <Select id="projectId" name="projectId" defaultValue="">
            <option value="" disabled>
              Select a project…
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Title" htmlFor="title" error={state?.error}>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Custom booking system"
          maxLength={maxTitleLength}
          required
        />
      </Field>

      <Field
        label="Describe what you need"
        htmlFor="description"
        hint={`The more detail you give — goals, features, constraints, budget hints — the more precise the AI's quotation will be. Max ${maxDescriptionLength} characters.`}
      >
        <Textarea id="description" name="description" rows={6} maxLength={maxDescriptionLength} required />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Generating quotation…" : "Get AI quotation"}
      </Button>
    </form>
  );
}
