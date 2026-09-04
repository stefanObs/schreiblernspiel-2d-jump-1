/** Schreibtabelle / Anlaut tiles — own catalog (Stil-C art later). */

export type AnlautRegion =
  | "sidebar"
  | "vowels"
  | "diphthongs"
  | "consonantsMain"
  | "consonantsRight";

export type AnlautTile = {
  id: string;
  /** Uppercase form shown first (e.g. "A" or "Sch"). */
  upper: string;
  /** Lowercase form (e.g. "a" or "sch"). Empty for trailing-only marks. */
  lower: string;
  word: string;
  /** Single phonetic laut for TTS (aaa/buh/sch) — never letter names or „wie Affe“. */
  speak: string;
  region: AnlautRegion;
  /** Optional Stil-C icon; missing → letter placeholder in UI. */
  image?: string;
  /** Visual accent (Dehnungs-e). */
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

/** Full chart order for Thurgau-style layout (S02+). */
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

  // —— Vokale ——
  tile({
    id: "i",
    upper: "I",
    word: "Insel",
    speak: "iii",
    region: "vowels",
    image: "/art/anlaut_insel.png",
  }),
  tile({
    id: "e",
    upper: "E",
    word: "Esel",
    speak: "eee",
    region: "vowels",
    image: "/art/anlaut_esel.png",
  }),
  tile({
    id: "a",
    upper: "A",
    word: "Affe",
    speak: "aaa",
    region: "vowels",
    image: "/art/anlaut_affe.png",
  }),
  tile({ id: "o", upper: "O", word: "Ofen", speak: "ooo", region: "vowels" }),
  tile({ id: "u", upper: "U", word: "Unfall", speak: "uuu", region: "vowels" }),
  tile({ id: "ie", upper: "Ie", lower: "ie", word: "Biene", speak: "ie", region: "vowels" }),
  tile({ id: "ae", upper: "Ä", lower: "ä", word: "Äpfel", speak: "äää", region: "vowels" }),
  tile({ id: "oe", upper: "Ö", lower: "ö", word: "Öl", speak: "ööö", region: "vowels" }),
  tile({ id: "ue", upper: "Ü", lower: "ü", word: "Überraschung", speak: "üüü", region: "vowels" }),

  // —— Diphthonge ——
  tile({ id: "eu", upper: "Eu", lower: "eu", word: "Eule", speak: "oi", region: "diphthongs" }),
  tile({ id: "ei", upper: "Ei", lower: "ei", word: "Ei", speak: "ai", region: "diphthongs" }),
  tile({ id: "au", upper: "Au", lower: "au", word: "Auge", speak: "au", region: "diphthongs" }),

  // —— Mitlaute Hauptbogen ——
  tile({ id: "r", upper: "R", word: "Rose", speak: "rrr", region: "consonantsMain" }),
  tile({
    id: "l",
    upper: "L",
    word: "Lampe",
    speak: "lll",
    region: "consonantsMain",
    image: "/art/anlaut_lampe.png",
  }),
  tile({ id: "n", upper: "N", word: "Nase", speak: "nnn", region: "consonantsMain" }),
  tile({
    id: "m",
    upper: "M",
    word: "Mantel",
    speak: "mmm",
    region: "consonantsMain",
    image: "/art/anlaut_mantel.png",
  }),
  tile({ id: "h", upper: "H", word: "Hose", speak: "hah", region: "consonantsMain" }),
  tile({ id: "j", upper: "J", word: "Jacke", speak: "jjj", region: "consonantsMain" }),
  tile({
    id: "s",
    upper: "S",
    word: "Sonne",
    speak: "sss",
    region: "consonantsMain",
    image: "/art/anlaut_sonne.png",
  }),
  tile({
    id: "sch",
    upper: "Sch",
    lower: "sch",
    word: "Schuhe",
    speak: "sch",
    region: "consonantsMain",
    image: "/art/anlaut_schuhe.png",
  }),
  tile({ id: "f", upper: "F", word: "Feder", speak: "fff", region: "consonantsMain" }),
  tile({ id: "w", upper: "W", word: "Wolke", speak: "www", region: "consonantsMain" }),
  tile({ id: "z", upper: "Z", word: "Ziege", speak: "ts", region: "consonantsMain" }),
  tile({ id: "d", upper: "D", word: "Dose", speak: "duh", region: "consonantsMain" }),
  tile({
    id: "t",
    upper: "T",
    word: "Tasse",
    speak: "tuh",
    region: "consonantsMain",
    image: "/art/anlaut_tasse.png",
  }),
  tile({
    id: "b",
    upper: "B",
    word: "Besen",
    speak: "buh",
    region: "consonantsMain",
    image: "/art/anlaut_besen.png",
  }),
  tile({ id: "p", upper: "P", word: "Pinsel", speak: "puh", region: "consonantsMain" }),
  tile({ id: "g", upper: "G", word: "Gabel", speak: "guh", region: "consonantsMain" }),
  tile({ id: "k", upper: "K", word: "Kerze", speak: "kuh", region: "consonantsMain" }),

  // —— Rechter Bogen / Ergänzungen ——
  tile({ id: "ng", upper: "Ng", lower: "ng", word: "Zange", speak: "ng", region: "consonantsRight" }),
  tile({ id: "ch", upper: "Ch", lower: "ch", word: "Buch", speak: "ch", region: "consonantsRight" }),
  tile({
    id: "e-silent",
    upper: "e",
    lower: "e",
    word: "Dehnung",
    speak: "e",
    region: "consonantsRight",
    accent: "green",
  }),
];

export const ANLAUT_REQUIRED_IDS = [
  "qu",
  "v",
  "x",
  "y",
  "c",
  "st",
  "sp",
  "pf",
  "i",
  "e",
  "a",
  "o",
  "u",
  "ie",
  "ae",
  "oe",
  "ue",
  "eu",
  "ei",
  "au",
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
  "ng",
  "ch",
  "e-silent",
] as const;

/** Strip legacy „… wie Wort“ / letter-name phrases → one laut. */
export function phoneticLautOnly(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const beforeWie = t.split(/\s+wie\s+/i)[0]?.trim() ?? t;
  // Drop trailing letter-name patterns like "A a"
  return beforeWie.replace(/\s+/g, " ").trim();
}

export function tilesInRegion(region: AnlautRegion): AnlautTile[] {
  return ANLAUT_TILES.filter((t) => t.region === region);
}
