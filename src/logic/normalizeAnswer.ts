export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/ae/g, "ä")
    .replace(/oe/g, "ö")
    .replace(/ue/g, "ü");
}

export function answersMatch(input: string, solution: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(solution);
}
