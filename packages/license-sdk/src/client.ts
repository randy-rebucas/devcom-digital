import { TtlCache } from "./cache.js";
import type { DevcomLicenseOptions, LicenseVerifyResult } from "./types.js";

const DEFAULT_BASE_URL = "https://devcomdigital.com";
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Server-side client for checking whether a Devcom Digital subscriber's
 * license key is currently valid. Call this from your tool's backend —
 * never expose the API key or this check to the browser.
 */
export class DevcomLicense {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly onError: "closed" | "open";
  private readonly timeoutMs: number;
  private readonly cache: TtlCache<LicenseVerifyResult>;

  constructor(options: DevcomLicenseOptions) {
    if (!options.apiKey) {
      throw new Error("DevcomLicense: apiKey is required");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.onError = options.onError ?? "closed";
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.cache = new TtlCache(options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS);
  }

  /**
   * Verifies a license key. Successful ("valid" or a definitive "invalid")
   * results are cached per key for `cacheTtlMs`; network/server failures
   * are never cached, so the next call retries against the API.
   */
  async verify(licenseKey: string): Promise<LicenseVerifyResult> {
    const key = licenseKey.trim();
    if (!key) return { valid: false, reason: "not_found" };

    const cached = this.cache.get(key);
    if (cached) return cached;

    let result: LicenseVerifyResult;
    try {
      result = await this.request(key);
    } catch {
      return this.onError === "open"
        ? { valid: true, status: "ACTIVE", userId: "" }
        : { valid: false, reason: "network_error" };
    }

    this.cache.set(key, result);
    return result;
  }

  /** Clears the in-memory cache. Mainly useful for tests. */
  clearCache() {
    this.cache.clear();
  }

  private async request(key: string): Promise<LicenseVerifyResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/license/verify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({ key }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        return { valid: false, reason: "unauthorized" };
      }
      if (!res.ok) {
        throw new Error(`Devcom license verify failed with status ${res.status}`);
      }

      return (await res.json()) as LicenseVerifyResult;
    } finally {
      clearTimeout(timeout);
    }
  }
}
