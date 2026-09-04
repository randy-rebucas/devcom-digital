"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/field";
import { updateAdminPipeline, setFollowUp } from "./actions";
import type { PipelineStage } from "@prisma/client";

const STAGES: PipelineStage[] = ["NEW", "QUOTED", "NEGOTIATING", "WON", "LOST"];

export function PipelineControls({
  id,
  stage,
  followUpAt,
}: {
  id: string;
  stage: PipelineStage;
  followUpAt: Date | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-paper-dim">
          Pipeline stage
        </label>
        <Select
          defaultValue={stage}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() => updateAdminPipeline(id, e.target.value as PipelineStage))
          }
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-paper-dim">
          Follow-up date
        </label>
        <input
          type="date"
          defaultValue={followUpAt ? followUpAt.toISOString().slice(0, 10) : ""}
          disabled={isPending}
          onChange={(e) => startTransition(() => setFollowUp(id, e.target.value || null))}
          className="mt-1.5 rounded-sm border border-hairline bg-ink px-3 py-2 text-sm text-paper transition-colors focus-visible:border-gold-bright"
        />
      </div>
    </div>
  );
}
