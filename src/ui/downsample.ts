// Returns up to maxPoints indices spread evenly across [0, length), always including
// the last index, so charts stay responsive over multi-thousand-swap traces without
// dropping the final cumulative value.
export function sampleIndices(length: number, maxPoints: number): number[] {
  if (length <= maxPoints) return Array.from({ length }, (_, i) => i);
  const step = (length - 1) / (maxPoints - 1);
  const indices = new Set<number>();
  for (let i = 0; i < maxPoints; i++) indices.add(Math.round(i * step));
  return Array.from(indices).sort((a, b) => a - b);
}
