export function shouldSpeakSolution(hintMode: "hear" | "motif", isTrace: boolean): boolean {
  return hintMode === "hear" && !isTrace;
}

export type SpeakFn = (text: string) => void;

export function speakGerman(text: string): void {
  if (!text || typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
