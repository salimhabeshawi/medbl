const ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];

/**
 * Formats a positive integer in Ge'ez (Ethiopic) numerals, e.g. 18 → ፲፰,
 * 100 → ፻, 2024 → ፳፻፳፬, 10000 → ፼.
 *
 * Ge'ez has no zero and no place value: digits are read in pairs from the
 * right, each pair written with a tens + ones glyph and followed by ፻ (×100)
 * or ፼ (×10,000) alternately. A pair equal to one is left implicit before a
 * multiplier (፻, never ፩፻), and an empty pair drops its ፻.
 *
 * Purely decorative here — it sits beside the Arabic-numeral "#N" and is
 * never the only rendering of a number. Returns "" for 0, negatives and
 * non-integers.
 */
export function toEthiopicNumeral(value: number): string {
  if (!Number.isInteger(value) || value <= 0) return "";

  let digits = String(value);
  if (digits.length % 2 === 1) digits = `0${digits}`;

  const pairCount = digits.length / 2;
  let out = "";

  for (let i = 0; i < pairCount; i += 1) {
    const tens = Number(digits[i * 2]);
    const ones = Number(digits[i * 2 + 1]);
    const pair = tens * 10 + ones;
    const position = pairCount - 1 - i; // 0 = rightmost pair

    const glyphs = pair === 1 && position > 0 ? "" : TENS[tens] + ONES[ones];
    let multiplier = "";
    if (position > 0) {
      multiplier = position % 2 === 1 ? "፻" : "፼";
      if (pair === 0 && position % 2 === 1) multiplier = "";
    }

    out += glyphs + multiplier;
  }

  return out;
}
