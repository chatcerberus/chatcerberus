const PALETTE = [
  { ring: "ring-indigo-400/40", dot: "bg-indigo-400", text: "text-indigo-300", glow: "shadow-[0_0_24px_-6px_oklch(0.62_0.21_285_/_0.6)]" },
  { ring: "ring-cyan-400/40", dot: "bg-cyan-400", text: "text-cyan-300", glow: "shadow-[0_0_24px_-6px_oklch(0.72_0.18_220_/_0.6)]" },
  { ring: "ring-fuchsia-400/40", dot: "bg-fuchsia-400", text: "text-fuchsia-300", glow: "shadow-[0_0_24px_-6px_oklch(0.65_0.24_330_/_0.6)]" },
  { ring: "ring-emerald-400/40", dot: "bg-emerald-400", text: "text-emerald-300", glow: "shadow-[0_0_24px_-6px_oklch(0.72_0.18_160_/_0.6)]" },
  { ring: "ring-amber-400/40", dot: "bg-amber-400", text: "text-amber-300", glow: "shadow-[0_0_24px_-6px_oklch(0.78_0.17_80_/_0.6)]" },
  { ring: "ring-rose-400/40", dot: "bg-rose-400", text: "text-rose-300", glow: "shadow-[0_0_24px_-6px_oklch(0.68_0.22_20_/_0.6)]" },
  { ring: "ring-sky-400/40", dot: "bg-sky-400", text: "text-sky-300", glow: "shadow-[0_0_24px_-6px_oklch(0.70_0.16_240_/_0.6)]" },
  { ring: "ring-violet-400/40", dot: "bg-violet-400", text: "text-violet-300", glow: "shadow-[0_0_24px_-6px_oklch(0.62_0.22_300_/_0.6)]" },
];

export function serverColor(serverId?: string) {
  if (!serverId) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < serverId.length; i++) hash = (hash * 31 + serverId.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}