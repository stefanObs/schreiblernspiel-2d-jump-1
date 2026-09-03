export function shouldSpeakSolution(hintMode: "hear" | "motif", isTrace: boolean): boolean {
  return hintMode === "hear" && !isTrace;
}

export type SpeakFn = (text: string) => void;

export type VoiceLike = { lang: string };

export function pickGermanVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  const list = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  return (
    list.find((v) => v.lang.toLowerCase().startsWith("de-de")) ??
    list.find((v) => v.lang.toLowerCase().startsWith("de-ch")) ??
    list[0]
  );
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
    return null;
  }
  return window.speechSynthesis;
}

/** Chrome remains "paused" and then speak() is silent. */
function kickSynth(s: SpeechSynthesis): void {
  if (s.paused) s.resume();
}

export function speakGerman(text: string): void {
  const spoken = text.trim();
  const s = synth();
  if (!spoken || !s) return;

  const start = (): void => {
    kickSynth(s);
    s.cancel();
    window.setTimeout(() => {
      kickSynth(s);
      const u = new SpeechSynthesisUtterance(spoken);
      u.lang = "de-DE";
      u.rate = 0.85;
      u.volume = 1;
      const voice = pickGermanVoice(s.getVoices());
      if (voice) u.voice = voice;
      s.speak(u);
      window.setTimeout(() => kickSynth(s), 80);
    }, 60);
  };

  if (s.getVoices().length === 0) {
    s.addEventListener("voiceschanged", start, { once: true });
    window.setTimeout(start, 300);
    return;
  }
  start();
}

/** Call from a click/tap so later auto-speak is allowed. */
export function unlockSpeech(): void {
  const s = synth();
  if (!s) return;
  kickSynth(s);
  if (s.getVoices().length === 0) s.getVoices();
  const warm = new SpeechSynthesisUtterance(".");
  warm.volume = 0;
  warm.rate = 2;
  s.speak(warm);
  s.cancel();
}
