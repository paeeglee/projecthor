function diceCoefficient(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

const THRESHOLD = 0.5;

export function findClosestSlug(input: string, slugs: string[]): string | null {
  const inputTokens = input.split("-");

  let bestSlug: string | null = null;
  let bestScore = 0;

  for (const slug of slugs) {
    const score = diceCoefficient(inputTokens, slug.split("-"));
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  return bestScore >= THRESHOLD ? bestSlug : null;
}
