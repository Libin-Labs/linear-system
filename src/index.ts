export interface LinearOptions {
  tolerance?: number;
  maxCells?: number;
}
export type LinearResult =
  | { kind: 'unique'; rank: number; solution: number[]; residual: number }
  | { kind: 'infinite'; rank: number; particular: number[]; basis: number[][]; residual: number }
  | { kind: 'inconsistent'; rank: number };
function finite(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('Nonfinite input or numerical overflow');
  return value;
}
export function solveLinear(
  matrix: readonly (readonly number[])[],
  rhs: readonly number[],
  options: LinearOptions = {},
): LinearResult {
  const tolerance = options.tolerance ?? 1e-10,
    maxCells = options.maxCells ?? 100000;
  if (
    !Number.isFinite(tolerance) ||
    tolerance <= 0 ||
    !Number.isSafeInteger(maxCells) ||
    maxCells < 1 ||
    maxCells > 1000000
  )
    throw new RangeError('Invalid numerical options');
  if (
    !Array.isArray(matrix) ||
    matrix.length < 1 ||
    matrix.length > 256 ||
    !Array.isArray(rhs) ||
    rhs.length !== matrix.length
  )
    throw new RangeError('Invalid system rows');
  const columns = matrix[0]?.length ?? 0;
  if (columns < 1 || columns > 256 || matrix.length * (columns + 1) > maxCells)
    throw new RangeError('Invalid system columns or cell budget');
  const original = matrix.map((row) => {
    if (!Array.isArray(row) || row.length !== columns)
      throw new RangeError('Matrix must be rectangular');
    return Array.from(row, finite);
  });
  const b = Array.from(rhs, finite),
    a = original.map((row, i) => [...row, b[i]!]),
    pivots: number[] = [];
  let rank = 0;
  for (let column = 0; column < columns && rank < a.length; column++) {
    let best = rank;
    for (let i = rank + 1; i < a.length; i++)
      if (Math.abs(a[i]![column]!) > Math.abs(a[best]![column]!)) best = i;
    if (Math.abs(a[best]![column]!) <= tolerance) continue;
    [a[rank], a[best]] = [a[best]!, a[rank]!];
    const pivot = a[rank]![column]!;
    for (let j = column; j <= columns; j++) a[rank]![j] = finite(a[rank]![j]! / pivot);
    for (let i = 0; i < a.length; i++)
      if (i !== rank) {
        const factor = a[i]![column]!;
        for (let j = column + 1; j <= columns; j++)
          a[i]![j] = finite(a[i]![j]! - finite(factor * a[rank]![j]!));
        a[i]![column] = 0;
      }
    pivots.push(column);
    rank++;
  }
  for (let i = rank; i < a.length; i++)
    if (Math.abs(a[i]![columns]!) > tolerance) return { kind: 'inconsistent', rank };
  const solution = Array<number>(columns).fill(0);
  for (let i = 0; i < rank; i++) solution[pivots[i]!] = a[i]![columns]!;
  let residual = 0;
  for (let i = 0; i < original.length; i++) {
    let sum = 0;
    for (let j = 0; j < columns; j++) sum = finite(sum + finite(original[i]![j]! * solution[j]!));
    residual = Math.max(residual, Math.abs(finite(sum - b[i]!)));
  }
  if (rank === columns) return { kind: 'unique', rank, solution, residual };
  const pivotSet = new Set(pivots),
    basis: number[][] = [];
  for (let free = 0; free < columns; free++)
    if (!pivotSet.has(free)) {
      const vector = Array<number>(columns).fill(0);
      vector[free] = 1;
      for (let i = 0; i < rank; i++) vector[pivots[i]!] = -a[i]![free]!;
      basis.push(vector);
    }
  return { kind: 'infinite', rank, particular: solution, basis, residual };
}
