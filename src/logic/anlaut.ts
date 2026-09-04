export type AnlautTile = {
  id: string;
  /** Uppercase form shown first (e.g. "A" or "Sch"). */
  upper: string;
  /** Lowercase form (e.g. "a" or "sch"). */
  lower: string;
  word: string;
  /** Phonetic Anlaut + Bildwort for TTS (lautiert, not buchstabiert). */
  speak: string;
  /** Key matching bundled /voice/*.wav clips. */
  clipKey: string;
  image: string;
};

export const ANLAUT_TILES: AnlautTile[] = [
  {
    id: "a",
    upper: "A",
    lower: "a",
    word: "Affe",
    speak: "aaa wie Affe",
    clipKey: "A wie Affe",
    image: "/art/anlaut_affe.png",
  },
  {
    id: "e",
    upper: "E",
    lower: "e",
    word: "Esel",
    speak: "eee wie Esel",
    clipKey: "E wie Esel",
    image: "/art/anlaut_esel.png",
  },
  {
    id: "i",
    upper: "I",
    lower: "i",
    word: "Insel",
    speak: "iii wie Insel",
    clipKey: "I wie Insel",
    image: "/art/anlaut_insel.png",
  },
  {
    id: "b",
    upper: "B",
    lower: "b",
    word: "Besen",
    speak: "buh wie Besen",
    clipKey: "B wie Besen",
    image: "/art/anlaut_besen.png",
  },
  {
    id: "l",
    upper: "L",
    lower: "l",
    word: "Lampe",
    speak: "lll wie Lampe",
    clipKey: "L wie Lampe",
    image: "/art/anlaut_lampe.png",
  },
  {
    id: "m",
    upper: "M",
    lower: "m",
    word: "Mantel",
    speak: "mmm wie Mantel",
    clipKey: "M wie Mantel",
    image: "/art/anlaut_mantel.png",
  },
  {
    id: "s",
    upper: "S",
    lower: "s",
    word: "Sonne",
    speak: "sss wie Sonne",
    clipKey: "S wie Sonne",
    image: "/art/anlaut_sonne.png",
  },
  {
    id: "t",
    upper: "T",
    lower: "t",
    word: "Tasse",
    speak: "tuh wie Tasse",
    clipKey: "T wie Tasse",
    image: "/art/anlaut_tasse.png",
  },
  {
    id: "sch",
    upper: "Sch",
    lower: "sch",
    word: "Schuhe",
    speak: "sch wie Schuhe",
    clipKey: "Sch wie Schuhe",
    image: "/art/anlaut_schuhe.png",
  },
];
