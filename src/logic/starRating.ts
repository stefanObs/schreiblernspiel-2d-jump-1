/** Star rating after a solved puzzle: 3 max, −½ star per 2 wrong tries, min 1. */
export function starsFromWrongAttempts(wrongAttempts: number): number {
  const n = Math.max(0, Math.floor(wrongAttempts));
  const halvesLost = Math.floor(n / 2);
  return Math.max(1, 3 - halvesLost * 0.5);
}

export function starFillLevels(stars: number): Array<"full" | "half" | "empty"> {
  const levels: Array<"full" | "half" | "empty"> = [];
  for (let i = 0; i < 3; i++) {
    const remain = stars - i;
    if (remain >= 1) levels.push("full");
    else if (remain >= 0.5) levels.push("half");
    else levels.push("empty");
  }
  return levels;
}
