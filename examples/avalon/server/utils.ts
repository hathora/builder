export function shuffle<T>(randInt: () => number, items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function histogram<T>(items: T[]) {
  const histo = new Map<T, number>();
  items.forEach((item) => histo.set(item, (histo.get(item) || 0) + 1));
  return histo;
}
