export const rnd = (a) => a[Math.floor(Math.random() * a.length)];

export function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function lastName(n) {
  const parts = n.split(' ');
  return parts[parts.length - 1];
}
