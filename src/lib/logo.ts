/**
 * Shared geometry for the Devcom Digital keyhole mark — a locked
 * square that resolves to a keyhole, echoing "one credential unlocks
 * every tool." Kept as raw SVG markup so the exact same shape can back
 * both the React navbar mark and the generated favicon/apple-icon,
 * which render through next/og rather than JSX.
 */
export function logoMarkSvg({
  gold = "#c9973f",
  ink = "#15120e",
}: {
  gold?: string;
  ink?: string;
} = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="4" y="4" width="92" height="92" rx="18" fill="${gold}" />
  <circle cx="50" cy="40" r="12" fill="${ink}" />
  <polygon points="44,48 56,48 64,78 36,78" fill="${ink}" />
</svg>`;
}
