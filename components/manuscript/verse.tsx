import { Fragment } from "react";
import { cn } from "cn";

/**
 * A poem body set as verse: blank lines split stanzas into separate
 * paragraphs (so stanza spacing is real spacing, not doubled line-height),
 * and single newlines stay as line breaks. The text itself is rendered
 * exactly as stored — user-generated content is never altered.
 *
 * Size follows the reader's text-size preference through the
 * `--verse-scale` custom property (see ReadingToolbar).
 */
export function Verse({ body, className }: { body: string; className?: string }) {
  const stanzas = body
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/);

  return (
    <div className={cn("verse", className)}>
      {stanzas.map((stanza, stanzaIndex) => {
        const lines = stanza.split("\n");
        return (
          <p key={stanzaIndex}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
