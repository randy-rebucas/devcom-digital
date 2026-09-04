import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TtlCache } from "./cache.js";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for a missing key", () => {
    const cache = new TtlCache<string>(1000);
    expect(cache.get("missing")).toBeUndefined();
  });

  it("returns a value that was set", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key", "value");
    expect(cache.get("key")).toBe("value");
  });

  it("expires a value after the ttl elapses", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key", "value");
    vi.advanceTimersByTime(1001);
    expect(cache.get("key")).toBeUndefined();
  });

  it("does not store anything when ttlMs is 0", () => {
    const cache = new TtlCache<string>(0);
    cache.set("key", "value");
    expect(cache.get("key")).toBeUndefined();
  });

  it("clear() removes all entries", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("a", "1");
    cache.set("b", "2");
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });
});
