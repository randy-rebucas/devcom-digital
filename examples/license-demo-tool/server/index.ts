import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { DevcomLicense } from "@devcomdigital/license-sdk";
import { requireLicense } from "@devcomdigital/license-sdk/express";

// Mirrors Vite's env file precedence: .env, then .env.local overrides it.
config();
config({ path: ".env.local", override: true });

// Per-tool API key issued in the Devcom admin: Tools -> (your tool) -> Edit
// -> License verification API key. Never expose this to the browser.
const license = new DevcomLicense({
  apiKey: process.env.DEVCOM_TOOL_API_KEY ?? "",
  baseUrl: process.env.DEVCOM_BASE_URL ?? "http://localhost:3000",
});

const app = express();
app.use(cors());
app.use(express.json());

// Everything under /api/protected requires a valid license key, sent by
// the frontend in the x-license-key header.
app.use("/api/protected", requireLicense(license));

app.get("/api/protected/whoami", (req, res) => {
  const result = (req as express.Request & { devcomLicense?: { userId: string } }).devcomLicense;
  res.json({ userId: result?.userId ?? null });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`license-demo-tool server listening on http://localhost:${port}`);
});
