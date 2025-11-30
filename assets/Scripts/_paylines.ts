const NOTATED_LINES = [
  // 1. Ngang giữa (middle row): hàng 1
  `
    -----
    *****
    ----
    `, // Payline 1

  // 2. Ngang trên: hàng 0
  `
    *****
    ----
    ----
    `, // Payline 2

  // 3. Ngang dưới: hàng 2
  `
    ----
    ---
    *****
    `, // Payline 3

  // 4. Chéo từ trên trái → dưới phải
  `
    *----
    -*---
    ---*--
    ----*-
    -----*
    `, // Payline 4

  // 5. Chéo từ dưới trái → trên phải
  `
    -----*
    ---*--
    --*---
    -*----
    *-----
    `, // Payline 5

  // 6. Zig-zag lên rồi xuống
  `
    -*-*-
    *-*-*
    -*-*-
    `, // Payline 6

  // 7. Zig-zag xuống rồi lên
  `
    *-*-*
    -*-*-
    *-*-*
    `, // Payline 7

  // 8. V-shape (v-ngược) từ trên hàng 0 → hàng 2 → hàng 0
  `
    *----*
    -*-*-
    --*--
    `, // Payline 8

  // 9. A-shape (hình chữ A) từ dưới hàng 2 → hàng 0 → hàng 2
  `
    --*--
    -*-*-
    *---*
    `, // Payline 9

  // 10. “Double zig-zag” (lên-xuống-lên)
  `
    *-*-*
    -*-*-
    *-*-*
    `, // Payline 10
];

// Convert human-friendly paylines into sequences of row indices
const paylines: number[][] = NOTATED_LINES.map(convertToRowSequence);

/** Convert a single payline into an array of row indices */
function convertToRowSequence(line: string): number[] {
  const rows = getRows(line);
  const columns = rows[0].length;
  const sequence = [];
  for (let column = 0; column < columns; column++) {
    sequence.push(rows.findIndex((row) => row[column] === "*"));
  }
  return sequence;
}

/** Split the notated payline into an array of trimmed rows */
function getRows(line: string): string[] {
  return line
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean); // Remove any empty lines that may remain
}

export { paylines };
