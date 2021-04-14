import seedrandom from "seedrandom";

export function shuffle<T>(seed: string, items: T[]) {
  const rng = seedrandom(seed);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.int32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function histogram<T>(items: T[]) {
  const histo = new Map<T, number>();
  items.forEach((item) => histo.set(item, (histo.get(item) || 0) + 1));
  return histo;
}
