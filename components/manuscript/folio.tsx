import { cn } from "cn";
import { toEthiopicNumeral } from "@/lib/ethiopic";

/**
 * A poem's number styled like a manuscript folio mark: the familiar "#N" in
 * Lora, with the same number in Ge'ez numerals beside it as a quiet
 * cultural echo. The Ge'ez form is decorative (aria-hidden); "#N" is what
 * gets read out.
 */
export function Folio({
  number,
  size = "sm",
  className,
}: {
  number: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const geez = toEthiopicNumeral(number);

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums",
        size === "lg" ? "gap-3" : "gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-serif font-semibold",
          size === "lg"
            ? "text-4xl text-primary sm:text-5xl"
            : "text-sm text-muted-foreground",
        )}
      >
        #{number}
      </span>
      {geez ? (
        <span
          aria-hidden="true"
          className={cn(
            "font-sans text-primary/60",
            size === "lg" ? "text-xl sm:text-2xl" : "text-xs",
          )}
        >
          {geez}
        </span>
      ) : null}
    </span>
  );
}
