import { FormEvent, useState } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000";
const STORAGE_KEY = "devcom-license-key";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "unlocked"; userId: string }
  | { state: "locked"; reason: string };

/**
 * The React frontend never verifies a license key itself — it only holds
 * the key the user typed and sends it to this tool's own backend, which
 * calls @devcomdigital/license-sdk server-side. See server/index.ts.
 */
export function App() {
  const [key, setKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function checkLicense(licenseKey: string) {
    setStatus({ state: "checking" });
    try {
      const res = await fetch(`${SERVER_URL}/api/protected/whoami`, {
        headers: { "x-license-key": licenseKey },
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus({ state: "locked", reason: body.reason ?? "invalid" });
        return;
      }
      setStatus({ state: "unlocked", userId: body.userId });
    } catch {
      setStatus({ state: "locked", reason: "network_error" });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, key);
    checkLicense(key);
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "4rem auto" }}>
      <h1>License Demo Tool</h1>
      <p>Enter the Devcom license key from your subscriber dashboard.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="DEVCOM-XXXX-XXXX-XXXX-XXXX"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={!key || status.state === "checking"}>
          {status.state === "checking" ? "Checking..." : "Unlock"}
        </button>
      </form>

      {status.state === "unlocked" && (
        <p style={{ color: "green" }}>Unlocked for user {status.userId}.</p>
      )}
      {status.state === "locked" && (
        <p style={{ color: "crimson" }}>Access denied: {status.reason}</p>
      )}
    </main>
  );
}
