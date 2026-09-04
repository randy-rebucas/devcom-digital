import type { NextFunction, Request, Response } from "express";
import type { DevcomLicense } from "../client.js";

export interface RequireLicenseOptions {
  /** Extracts the license key from the request. Default: `req.headers["x-license-key"]`. */
  getLicenseKey?: (req: Request) => string | undefined;
  /** Called on an invalid/missing key instead of the default 403 JSON response. */
  onInvalid?: (req: Request, res: Response, reason: string) => void;
}

/**
 * Express middleware that blocks the request unless the caller supplies a
 * valid Devcom license key. On success, attaches `req.devcomLicense`.
 */
export function requireLicense(license: DevcomLicense, options: RequireLicenseOptions = {}) {
  const getLicenseKey =
    options.getLicenseKey ?? ((req: Request) => req.headers["x-license-key"] as string | undefined);

  return async function requireLicenseMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = getLicenseKey(req);
    if (!key) {
      return options.onInvalid
        ? options.onInvalid(req, res, "not_found")
        : res.status(403).json({ error: "License key required" });
    }

    const result = await license.verify(key);
    if (!result.valid) {
      return options.onInvalid
        ? options.onInvalid(req, res, result.reason)
        : res.status(403).json({ error: "Invalid license", reason: result.reason });
    }

    (req as Request & { devcomLicense?: typeof result }).devcomLicense = result;
    next();
  };
}
