/** Schreibtabelle — Thurgau-Bögen: feste Reihenfolge, Ein-Laut-TTS. */

export type AnlautRegion =
  | "sidebar"
  | "leftVowels"
  | "leftBottom"
  | "leftRight"
  | "rightArch"
  | "diphthongs";

export type AnlautTile = {
  id: string;
  upper: string;
  lower: string;
  word: string;
  /** Single phonetic laut — never letter names or „wie Affe“. */
  speak: string;
  region: AnlautRegion;
  /** Required for leftBottom; optional elsewhere until art lands. */
  image?: string;
  accent?: "green";
};

function tile(
  partial: Omit<AnlautTile, "lower"> & { lower?: string },
): AnlautTile {
  return {
    ...partial,
    lower: partial.lower ?? partial.upper.toLowerCase(),
  };
}

/**
 * Linker Bogen — unten links (Paare), feste Reihenfolge wie Referenz.
 * Jede Kachel braucht ein Bildwort-Icon.
 */
export const LEFT_BOTTOM_ORDER = [
  "r",
  "l",
  "n",
  "m",
  "h",
  "j",
  "s",
  "sch",
  "f",
  "w",
  "z",
  "d",
  "t",
  "b",
  "p",
  "g",
  "k",
] as const;

/** Linker Bogen — rechte Spalte (Kleinbuchstaben + ng/ch). */
export const LEFT_RIGHT_ORDER = [
  "r",
  "l",
  "n",
  "m",
  "ng",
  "ch",
  "s",
  "sch",
  "f",
  "w",
  "z",
  "d",
  "t",
  "b",
  "p",
  "g",
  "k",
] as const;

/** Rechter Bogen — Spaltenreihenfolge (ohne grünes e). */
export const RIGHT_ARCH_ORDER = [
  "r",
  "l",
  "n",
  "m",
  "h",
  "ch",
  "s",
  "sch",
  "f",
  "w",
  "z",
  "d",
  "t",
  "b",
  "p",
  "g",
  "k",
  "r2",
  "l2",
  "n2",
  "m2",
] as const;

/** Vokale oben im linken Bogen (2 Zeilen: 5 + 4). */
export const LEFT_VOWEL_ORDER = ["i", "e", "a", "o", "u", "ie", "ae", "oe", "ue"] as const;

export const ANLAUT_TILES: AnlautTile[] = [
  // —— Seitenleiste ——
  tile({ id: "qu", upper: "Qu", lower: "qu", word: "Qualle", speak: "qu", region: "sidebar" }),
  tile({ id: "v", upper: "V", word: "Vogel", speak: "fff", region: "sidebar" }),
  tile({ id: "x", upper: "X", word: "Xylophon", speak: "ks", region: "sidebar" }),
  tile({ id: "y", upper: "Y", word: "Yak", speak: "jjj", region: "sidebar" }),
  tile({ id: "c", upper: "C", word: "Clown", speak: "kuh", region: "sidebar" }),
  tile({ id: "st", upper: "St", lower: "st", word: "Steine", speak: "scht", region: "sidebar" }),
  tile({ id: "sp", upper: "Sp", lower: "sp", word: "Spitzer", speak: "schp", region: "sidebar" }),
  tile({ id: "pf", upper: "Pf", lower: "pf", word: "Pfanne", speak: "pf", region: "sidebar" }),

  // —— Linker Bogen: Vokale (Farbe = mittlere 3er-Felder) ——
  tile({
    id: "i",
    upper: "I",
    word: "Insel",
    speak: "iii",
    region: "leftVowels",
    image: "/art/anlaut_insel.png",
  }),
  tile({
    id: "e",
    upper: "E",
    word: "Esel",
    speak: "eee",
    region: "leftVowels",
    image: "/art/anlaut_esel.png",
  }),
  tile({
    id: "a",
    upper: "A",
    word: "Affe",
    speak: "aaa",
    region: "leftVowels",
    image: "/art/anlaut_affe.png",
  }),
  tile({ id: "o", upper: "O", word: "Ofen", speak: "ooo", region: "leftVowels", image: "/art/anlaut_ofen.png" }),
  tile({
    id: "u",
    upper: "U",
    word: "Unfall",
    speak: "uuu",
    region: "leftVowels",
    image: "/art/anlaut_unfall.png",
  }),
  tile({
    id: "ie",
    upper: "Ie",
    lower: "ie",
    word: "Biene",
    speak: "ie",
    region: "leftVowels",
    image: "/art/anlaut_biene.png",
  }),
  tile({
    id: "ae",
    upper: "Ä",
    lower: "ä",
    word: "Äpfel",
    speak: "äää",
    region: "leftVowels",
    image: "/art/anlaut_aepfel.png",
  }),
  tile({ id: "oe", upper: "Ö", lower: "ö", word: "Öl", speak: "ööö", region: "leftVowels", image: "/art/anlaut_oel.png" }),
  tile({
    id: "ue",
    upper: "Ü",
    lower: "ü",
    word: "Überraschung",
    speak: "üüü",
    region: "leftVowels",
    image: "/art/anlaut_ueberraschung.png",
  }),

  // —— Linker Bogen: unten links (Pflicht-Bilder, feste Reihenfolge) ——
  tile({ id: "r", upper: "R", word: "Rose", speak: "rrr", region: "leftBottom", image: "/art/anlaut_rose.png" }),
  tile({
    id: "l",
    upper: "L",
    word: "Lampe",
    speak: "lll",
    region: "leftBottom",
    image: "/art/anlaut_lampe.png",
  }),
  tile({ id: "n", upper: "N", word: "Nase", speak: "nnn", region: "leftBottom", image: "/art/anlaut_nase.png" }),
  tile({
    id: "m",
    upper: "M",
    word: "Mantel",
    speak: "mmm",
    region: "leftBottom",
    image: "/art/anlaut_mantel.png",
  }),
  tile({ id: "h", upper: "H", word: "Hose", speak: "hah", region: "leftBottom", image: "/art/anlaut_hose.png" }),
  tile({ id: "j", upper: "J", word: "Jacke", speak: "jjj", region: "leftBottom", image: "/art/anlaut_jacke.png" }),
  tile({
    id: "s",
    upper: "S",
    word: "Sonne",
    speak: "sss",
    region: "leftBottom",
    image: "/art/anlaut_sonne.png",
  }),
  tile({
    id: "sch",
    upper: "Sch",
    lower: "sch",
    word: "Schuhe",
    speak: "sch",
    region: "leftBottom",
    image: "/art/anlaut_schuhe.png",
  }),
  tile({ id: "f", upper: "F", word: "Feder", speak: "fff", region: "leftBottom", image: "/art/anlaut_feder.png" }),
  tile({ id: "w", upper: "W", word: "Wolke", speak: "www", region: "leftBottom", image: "/art/anlaut_wolke.png" }),
  tile({ id: "z", upper: "Z", word: "Ziege", speak: "ts", region: "leftBottom", image: "/art/anlaut_ziege.png" }),
  tile({ id: "d", upper: "D", word: "Dose", speak: "duh", region: "leftBottom", image: "/art/anlaut_dose.png" }),
  tile({
    id: "t",
    upper: "T",
    word: "Tasse",
    speak: "tuh",
    region: "leftBottom",
    image: "/art/anlaut_tasse.png",
  }),
  tile({
    id: "b",
    upper: "B",
    word: "Besen",
    speak: "buh",
    region: "leftBottom",
    image: "/art/anlaut_besen.png",
  }),
  tile({ id: "p", upper: "P", word: "Pinsel", speak: "puh", region: "leftBottom", image: "/art/anlaut_pinsel.png" }),
  tile({ id: "g", upper: "G", word: "Gabel", speak: "guh", region: "leftBottom", image: "/art/anlaut_gabel.png" }),
  tile({ id: "k", upper: "K", word: "Kerze", speak: "kuh", region: "leftBottom", image: "/art/anlaut_kerze.png" }),

  // —— Linker Bogen rechts / Rechter Bogen: Zusatzlaute ——
  tile({ id: "ng", upper: "Ng", lower: "ng", word: "Zange", speak: "ng", region: "leftRight", image: "/art/anlaut_zange.png" }),
  tile({ id: "ch", upper: "Ch", lower: "ch", word: "Dach", speak: "ch", region: "leftRight", image: "/art/anlaut_dach.png" }),
  tile({
    id: "e-silent",
    upper: "e",
    lower: "e",
    word: "Dehnung",
    speak: "e",
    region: "rightArch",
    accent: "green",
    image: "/art/anlaut_dehnung_e.png",
  }),

  // —— Diphthonge ——
  tile({ id: "eu", upper: "Eu", lower: "eu", word: "Eule", speak: "oi", region: "diphthongs", image: "/art/anlaut_eule.png" }),
  tile({ id: "ei", upper: "Ei", lower: "ei", word: "Ei", speak: "ai", region: "diphthongs", image: "/art/anlaut_ei.png" }),
  tile({ id: "au", upper: "Au", lower: "au", word: "Auge", speak: "au", region: "diphthongs", image: "/art/anlaut_auge.png" }),
];

/** Aliases for right-arch duplicate r/l/n/m tiles (same laut/image as base). */
const RIGHT_DUP: Record<string, string> = {
  r2: "r",
  l2: "l",
  n2: "n",
  m2: "m",
};

export const ANLAUT_REQUIRED_IDS = [
  "qu",
  "v",
  "x",
  "y",
  "c",
  "st",
  "sp",
  "pf",
  ...LEFT_VOWEL_ORDER,
  "eu",
  "ei",
  "au",
  ...LEFT_BOTTOM_ORDER,
  "ng",
  "ch",
  "e-silent",
] as const;

const byId = new Map(ANLAUT_TILES.map((t) => [t.id, t]));

export function tileById(id: string): AnlautTile | undefined {
  const base = RIGHT_DUP[id] ?? id;
  return byId.get(base);
}

export function tilesInRegion(region: AnlautRegion): AnlautTile[] {
  return ANLAUT_TILES.filter((t) => t.region === region);
}

export function tilesInOrder(ids: readonly string[]): AnlautTile[] {
  return ids.map((id) => tileById(id)).filter((t): t is AnlautTile => Boolean(t));
}

/** Strip legacy „… wie Wort“ → one laut. */
export function phoneticLautOnly(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const beforeWie = t.split(/\s+wie\s+/i)[0]?.trim() ?? t;
  return beforeWie.replace(/\s+/g, " ").trim();
}
