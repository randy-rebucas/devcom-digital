import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { requireLicense } from "./express.js";
import type { DevcomLicense } from "../client.js";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("requireLicense", () => {
  it("responds 403 when no key is present", async () => {
    const license = { verify: vi.fn() } as unknown as DevcomLicense;
    const middleware = requireLicense(license);
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "License key required" });
    expect(next).not.toHaveBeenCalled();
    expect(license.verify).not.toHaveBeenCalled();
  });

  it("responds 403 when the key is invalid", async () => {
    const license = {
      verify: vi.fn().mockResolvedValue({ valid: false, reason: "revoked" }),
    } as unknown as DevcomLicense;
    const middleware = requireLicense(license);
    const req = { headers: { "x-license-key": "bad" } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid license", reason: "revoked" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches devcomLicense on a valid key", async () => {
    const active = { valid: true, status: "ACTIVE", userId: "u1" };
    const license = { verify: vi.fn().mockResolvedValue(active) } as unknown as DevcomLicense;
    const middleware = requireLicense(license);
    const req = { headers: { "x-license-key": "good" } } as unknown as Request & {
      devcomLicense?: unknown;
    };
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.devcomLicense).toEqual(active);
  });

  it("uses a custom getLicenseKey when provided", async () => {
    const active = { valid: true, status: "ACTIVE", userId: "u1" };
    const license = { verify: vi.fn().mockResolvedValue(active) } as unknown as DevcomLicense;
    const getLicenseKey = vi.fn().mockReturnValue("from-query");
    const middleware = requireLicense(license, { getLicenseKey });
    const req = { headers: {}, query: { key: "from-query" } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(getLicenseKey).toHaveBeenCalledWith(req);
    expect(license.verify).toHaveBeenCalledWith("from-query");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("uses a custom onInvalid handler instead of the default response", async () => {
    const license = { verify: vi.fn() } as unknown as DevcomLicense;
    const onInvalid = vi.fn();
    const middleware = requireLicense(license, { onInvalid });
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(onInvalid).toHaveBeenCalledWith(req, res, "not_found");
    expect(res.status).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
