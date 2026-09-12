import { ANLAUT_TILES } from "./anlaut";

/** Extra word illustrations (props + dedicated letter-pos art). */
const EXTRA_WORD_ART: Record<string, string> = {
  haus: "/art/prop_house.png",
  seil: "/art/prop_rope.png",
  baum: "/art/prop_tree.png",
  brücke: "/art/prop_bridge.png",
  hund: "/art/word_hund.png",
  fisch: "/art/word_fisch.png",
  topf: "/art/word_topf.png",
  rad: "/art/word_rad.png",
  kuh: "/art/word_kuh.png",
  bus: "/art/word_bus.png",
};

function normWord(word: string): string {
  return word.toLocaleLowerCase("de-DE").normalize("NFC");
}

/** Map display/lowercase word → public art path. */
export function letterPosWordArt(word: string): string | null {
  const key = normWord(word);
  if (EXTRA_WORD_ART[key]) return EXTRA_WORD_ART[key]!;
  for (const tile of ANLAUT_TILES) {
    if (!tile.image) continue;
    if (normWord(tile.word) === key) return tile.image;
  }
  return null;
}
