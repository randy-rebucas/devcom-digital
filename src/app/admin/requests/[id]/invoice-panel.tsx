"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type InvoiceInfo = {
  totalAmount: number;
  depositAmount: number | null;
  depositPaid: boolean;
  balancePaid: boolean;
  status: string;
} | null;

export function InvoicePanel({ id, invoice }: { id: string; invoice: InvoiceInfo }) {
  const [total, setTotal] = useState(invoice ? (invoice.totalAmount / 100).toFixed(2) : "");
  const [deposit, setDeposit] = useState(
    invoice?.depositAmount ? (invoice.depositAmount / 100).toFixed(2) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [approveUrl, setApproveUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    setError(null);
    setApproveUrl(null);
    const totalAmountCents = Math.round(parseFloat(total) * 100);
    if (!totalAmountCents || totalAmountCents <= 0) {
      setError("Enter a valid total amount.");
      return;
    }
    const depositAmountCents = deposit ? Math.round(parseFloat(deposit) * 100) : undefined;

    startTransition(async () => {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteRequestId: id, totalAmountCents, depositAmountCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create invoice.");
        return;
      }
      setApproveUrl(data.approveUrl ?? null);
    });
  }

  return (
    <section className="border-b border-hairline py-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-paper-dim">Invoice</h2>

      {invoice && (
        <p className="mt-2 text-sm text-paper-dim">
          Status: <span className="text-paper">{invoice.status}</span>
          {invoice.depositAmount && (
            <>
              {" "}
              &middot; Deposit {invoice.depositPaid ? "paid" : "unpaid"}
            </>
          )}
          {" "}
          &middot; Balance {invoice.balancePaid ? "paid" : "unpaid"}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <Field label="Total amount (USD)" htmlFor="total">
          <Input id="total" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="1500.00" />
        </Field>
        <Field label="Deposit amount (optional)" htmlFor="deposit">
          <Input id="deposit" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="500.00" />
        </Field>
        <Button type="button" size="sm" disabled={isPending} onClick={handleSend}>
          {isPending ? "Sending…" : "Send invoice"}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {approveUrl && (
        <p className="mt-2 text-xs text-paper-dim">
          Payment link:{" "}
          <a href={approveUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline">
            {approveUrl}
          </a>
        </p>
      )}
    </section>
  );
}
