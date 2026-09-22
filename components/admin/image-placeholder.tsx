const PALETTE = ["#EAD9C8", "#CFE3DA", "#F3D5D0", "#D9E6E1", "#E6DFF2"];

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/**
 * Local, deterministic stand-in for a missing image — no network request,
 * no external image host. Picks a soft color from the name.
 */
export function ImagePlaceholder({
  name,
  size = 38,
  radius = 10,
}: {
  name: string;
  size?: number;
  radius?: number;
}) {
  return (
    <span
      className="ad-thumb ad-thumb-letter"
      style={{ width: size, height: size, borderRadius: radius, background: toneFor(name || "?") }}
      aria-hidden="true"
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
