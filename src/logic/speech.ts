import { normalizeAnswer } from "./normalizeAnswer";

export function shouldSpeakSolution(hintMode: "hear" | "motif", isTrace: boolean): boolean {
  return hintMode === "hear" && !isTrace;
}

export type SpeakFn = (text: string) => void;

export type VoiceLike = { lang: string; name?: string };

/** Medium-slow pace — natural word, not syllable-by-syllable. */
export const LEARNER_SPEAK_RATE = 0.684;

/** Bundled clips play at normal speed when used as fallback. */
export const LEARNER_CLIP_RATE = 1;

/** Short pause before the first utterance. */
export const SPEAK_LEAD_PAUSE_MS = 280;

/** Longer pause between the two repetitions. */
export const SPEAK_REPEAT_PAUSE_MS = 750;

/** Speak the word this many times. */
export const SPEAK_REPEAT_COUNT = 2;

const GERMAN_UTTERANCE_LANG = "de-DE";

export function pickGermanVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  const norm = (lang: string) => lang.toLowerCase().replace(/_/g, "-");
  const de = voices.filter((v) => {
    const lang = norm(v.lang);
    const name = (v.name ?? "").toLowerCase();
    return (
      lang.startsWith("de") ||
      name.includes("german") ||
      name.includes("deutsch") ||
      name.includes("hedda") ||
      name.includes("katja") ||
      name.includes("stefan")
    );
  });
  return (
    de.find((v) => norm(v.lang).startsWith("de-de")) ??
    de.find((v) => norm(v.lang).startsWith("de-ch")) ??
    de.find((v) => norm(v.lang).startsWith("de-at")) ??
    de[0]
  );
}

/** Bundled clips so „Wort hören“ works even when the browser has no TTS voices. */
const CLIPS: Record<string, string> = {
  brücke: "/voice/bruecke.wav",
  auto: "/voice/auto.wav",
  "a wie affe": "/voice/a-wie-affe.wav",
  "e wie esel": "/voice/e-wie-esel.wav",
  "i wie insel": "/voice/i-wie-insel.wav",
  "b wie besen": "/voice/b-wie-besen.wav",
  "l wie lampe": "/voice/l-wie-lampe.wav",
  "m wie mantel": "/voice/m-wie-mantel.wav",
  "s wie sonne": "/voice/s-wie-sonne.wav",
  "t wie tasse": "/voice/t-wie-tasse.wav",
  "sch wie schuhe": "/voice/sch-wie-schuhe.wav",
};

export function voiceClipPath(text: string): string | undefined {
  return CLIPS[normalizeAnswer(text)];
}

/** Plain wording — no syllable hyphens or stress markers. */
export function learnerSpeakText(text: string): string {
  return text.trim();
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
    return null;
  }
  return window.speechSynthesis;
}

let clip: HTMLAudioElement | null = null;
const speakTimers: number[] = [];
let cachedGermanVoice: SpeechSynthesisVoice | null | undefined;
let voicesHooked = false;

function refreshGermanVoiceCache(): void {
  const s = synth();
  if (!s) {
    cachedGermanVoice = null;
    return;
  }
  cachedGermanVoice = pickGermanVoice(s.getVoices()) ?? null;
}

function ensureVoiceListener(): void {
  const s = synth();
  if (!s || voicesHooked) return;
  voicesHooked = true;
  s.addEventListener("voiceschanged", () => {
    refreshGermanVoiceCache();
  });
  refreshGermanVoiceCache();
}

function germanVoice(): SpeechSynthesisVoice | undefined {
  ensureVoiceListener();
  const s = synth();
  if (!s) return undefined;
  if (!cachedGermanVoice) refreshGermanVoiceCache();
  return cachedGermanVoice ?? undefined;
}

/** Wait briefly for async voice lists (Chrome), then run. */
function whenVoicesReady(fn: () => void): void {
  ensureVoiceListener();
  const s = synth();
  if (!s) {
    fn();
    return;
  }
  if (s.getVoices().length > 0 || cachedGermanVoice) {
    fn();
    return;
  }
  let ran = false;
  const done = () => {
    if (ran) return;
    ran = true;
    refreshGermanVoiceCache();
    fn();
  };
  s.addEventListener("voiceschanged", done, { once: true });
  // Fallback if voiceschanged never fires on this platform.
  scheduleSpeak(400, done);
}

function clearSpeakSchedule(): void {
  while (speakTimers.length) {
    const id = speakTimers.pop();
    if (id !== undefined) clearTimeout(id);
  }
  clip?.pause();
  clip = null;
  const s = synth();
  if (s) s.cancel();
}

function scheduleSpeak(delayMs: number, fn: () => void): void {
  const id = window.setTimeout(fn, delayMs);
  speakTimers.push(id);
}

function playClipOnce(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    clip?.pause();
    clip = new Audio(url);
    clip.volume = 1;
    clip.playbackRate = LEARNER_CLIP_RATE;
    if ("preservesPitch" in clip) {
      (clip as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = true;
    }
    if ("mozPreservesPitch" in clip) {
      (clip as HTMLAudioElement & { mozPreservesPitch: boolean }).mozPreservesPitch = true;
    }
    clip.onended = () => resolve();
    clip.onerror = () => reject(new Error("clip failed"));
    const play = clip.play();
    if (play && typeof play.catch === "function") {
      play.catch(reject);
    }
  });
}

function playClipRepeated(url: string, spoken: string): boolean {
  if (typeof Audio === "undefined") return false;
  clearSpeakSchedule();

  let remaining = SPEAK_REPEAT_COUNT;
  const playNext = (delayMs: number) => {
    scheduleSpeak(delayMs, () => {
      remaining -= 1;
      playClipOnce(url)
        .then(() => {
          if (remaining > 0) playNext(SPEAK_REPEAT_PAUSE_MS);
        })
        .catch(() => speakWithSynth(spoken));
    });
  };
  playNext(SPEAK_LEAD_PAUSE_MS);
  return true;
}

function buildGermanUtterance(spoken: string): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(spoken);
  u.lang = GERMAN_UTTERANCE_LANG;
  u.rate = LEARNER_SPEAK_RATE;
  u.volume = 1;
  const voice = germanVoice();
  if (voice) {
    u.voice = voice;
    // Keep lang aligned with the chosen voice when possible.
    if (voice.lang) u.lang = voice.lang.toLowerCase().startsWith("de") ? voice.lang : GERMAN_UTTERANCE_LANG;
  }
  return u;
}

function speakWithSynth(text: string): void {
  const spoken = learnerSpeakText(text);
  const s = synth();
  if (!spoken || !s) return;
  clearSpeakSchedule();
  if (s.paused) s.resume();

  whenVoicesReady(() => {
    let remaining = SPEAK_REPEAT_COUNT;
    const speakNext = (delayMs: number) => {
      scheduleSpeak(delayMs, () => {
        remaining -= 1;
        if (s.paused) s.resume();
        const u = buildGermanUtterance(spoken);
        u.onend = () => {
          if (remaining > 0) speakNext(SPEAK_REPEAT_PAUSE_MS);
        };
        s.speak(u);
        if (s.paused) s.resume();
      });
    };
    speakNext(SPEAK_LEAD_PAUSE_MS);
  });
}

function speakWithSynthOnce(text: string): void {
  const spoken = learnerSpeakText(text);
  const s = synth();
  if (!spoken || !s) return;
  clearSpeakSchedule();
  if (s.paused) s.resume();
  whenVoicesReady(() => {
    if (s.paused) s.resume();
    s.speak(buildGermanUtterance(spoken));
    if (s.paused) s.resume();
  });
}

/**
 * Anlaut tile: speak exactly one phonetic laut (aaa/buh/sch), never
 * alphabet names and never „A wie Affe“. Clip keys with Bildwort are ignored.
 */
export function speakAnlaut(_clipKey: string, phoneticSpeak: string): void {
  const phonetic = phoneticSpeak.trim();
  if (!phonetic) return;
  // Always synth the laut only — bundled „X wie Wort“ clips must not play.
  speakWithSynthOnce(phonetic);
}

export function speakGerman(text: string): void {
  const spoken = text.trim();
  if (!spoken) return;
  unlockSpeech();
  // Prefer TTS so words stay natural (no baked-in syllable pauses in clips).
  if (synth()) {
    speakWithSynth(spoken);
    return;
  }
  const url = voiceClipPath(spoken);
  if (url && playClipRepeated(url, spoken)) return;
}

/** Call from a click/tap so later speechSynthesis is allowed when voices exist. */
export function unlockSpeech(): void {
  const s = synth();
  if (!s) return;
  ensureVoiceListener();
  if (s.paused) s.resume();
  // Nudge voice list load on platforms that defer it until after a user gesture.
  void s.getVoices();
}
