// Only allow http(s) URLs — blocks javascript:, data:, and other schemes
// that would execute when rendered in an <a href> or <img src>.
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
