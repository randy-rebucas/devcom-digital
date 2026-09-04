import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DevcomLicense } from "./client.js";

function jsonResponse(status: number, body: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as Response;
}

describe("DevcomLicense", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("throws if apiKey is missing", () => {
    expect(() => new DevcomLicense({ apiKey: "" })).toThrow(/apiKey is required/);
  });

  it("treats an empty key as not_found without calling the network", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    const result = await license.verify("   ");

    expect(result).toEqual({ valid: false, reason: "not_found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a valid result from the API and caches it", async () => {
    const active = { valid: true, status: "ACTIVE", userId: "u1" } as const;
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, active));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    const result = await license.verify("abc");
    expect(result).toEqual(active);

    const cached = await license.verify("abc");
    expect(cached).toEqual(active);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps a 401 response to unauthorized without throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, {}));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    const result = await license.verify("abc");
    expect(result).toEqual({ valid: false, reason: "unauthorized" });
  });

  it("fails closed on network error by default", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    const result = await license.verify("abc");
    expect(result).toEqual({ valid: false, reason: "network_error" });
  });

  it("fails open when onError is 'open'", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k", onError: "open" });

    const result = await license.verify("abc");
    expect(result).toEqual({ valid: true, status: "ACTIVE", userId: "" });
  });

  it("does not cache network/server failures, so the next call retries", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    await license.verify("abc");
    await license.verify("abc");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clearCache() forces a fresh network call", async () => {
    const active = { valid: true, status: "ACTIVE", userId: "u1" } as const;
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, active));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "k" });

    await license.verify("abc");
    license.clearCache();
    await license.verify("abc");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sends the api key header and trimmed key in the request body", async () => {
    const active = { valid: true, status: "ACTIVE", userId: "u1" } as const;
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, active));
    vi.stubGlobal("fetch", fetchMock);
    const license = new DevcomLicense({ apiKey: "secret", baseUrl: "https://example.com/" });

    await license.verify("  abc  ");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/license/verify",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "secret" }),
        body: JSON.stringify({ key: "abc" }),
      })
    );
  });
});
