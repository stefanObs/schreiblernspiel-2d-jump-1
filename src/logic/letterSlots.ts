/** Join 2×3 letter-slot values for puzzle matching (empty slots skipped). */

export const LETTER_SLOT_COUNT = 6;

/** Non-empty slots left→right; gaps allowed. */
export function joinLetterSlots(slots: readonly string[]): string {
  return slots.map((s) => s.trim()).filter(Boolean).join("");
}

/** Index of the next empty slot after `from` (exclusive), or -1. */
export function nextEmptySlotIndex(slots: readonly string[], from: number): number {
  for (let i = from + 1; i < slots.length; i++) {
    if (!slots[i]?.trim()) return i;
  }
  return -1;
}
