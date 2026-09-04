"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { decideQuoteRequest } from "../actions";

export function DecisionButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => decideQuoteRequest(id, "ACCEPTED"))}
      >
        Accept quote
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => startTransition(() => decideQuoteRequest(id, "DECLINED"))}
      >
        Decline
      </Button>
    </div>
  );
}
