import { cn } from "cn";

const VARIANTS = {
  // Rendered as a mask, so only the shape matters — the fill comes from currentColor.
  mark: { src: "/brand/medbl-mark-black.svg", ratio: "1 / 1" },
  "lockup-horizontal": {
    src: "/brand/medbl-lockup-horizontal-currentcolor.svg",
    ratio: "1600 / 560",
  },
  "lockup-stacked": {
    src: "/brand/medbl-lockup-stacked-currentcolor.svg",
    ratio: "1 / 1",
  },
} as const;

type Props = {
  variant?: keyof typeof VARIANTS;
  className?: string; // set the height, e.g. "h-8", and the color, e.g. "text-foreground"
};

export function Logo({ variant = "lockup-horizontal", className }: Props) {
  const { src, ratio } = VARIANTS[variant];
  const mask = `url(${src}) center / contain no-repeat`;
  return (
    <span
      role="img"
      aria-label="Medbl"
      className={cn("inline-block bg-current", className)}
      style={{ aspectRatio: ratio, WebkitMask: mask, mask }}
    />
  );
}
