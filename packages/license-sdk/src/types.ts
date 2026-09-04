export type LicenseInvalidReason =
  | "not_found"
  | "revoked"
  | "subscription_inactive"
  | "network_error"
  | "unauthorized";

export type LicenseVerifyResult =
  | { valid: true; status: "ACTIVE"; userId: string }
  | { valid: false; reason: LicenseInvalidReason };

export interface DevcomLicenseOptions {
  /** Per-tool API key issued in the Devcom admin (Tools -> your tool -> API key). */
  apiKey: string;
  /** Base URL of the Devcom Digital app. Defaults to the production site. */
  baseUrl?: string;
  /**
   * How long a successful verification result is cached in memory, in ms.
   * Avoids a network round trip on every request. Default: 10 minutes.
   */
  cacheTtlMs?: number;
  /**
   * What to return when the verify request itself fails (network error,
   * 5xx, timeout) rather than the API returning a definitive answer.
   * "closed" (default) treats the key as invalid — safer, but an outage
   * on the Devcom side blocks every tool. "open" treats it as valid —
   * only use this if your tool can tolerate briefly admitting an
   * unverifiable user.
   */
  onError?: "closed" | "open";
  /** Request timeout in ms. Default: 5000. */
  timeoutMs?: number;
}
