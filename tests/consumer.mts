import { solveLinear, type LinearOptions, type LinearResult } from '@lp-labs/linear-system';
export type PublicTypes = [LinearOptions, LinearResult];
void solveLinear;
const result: LinearResult = solveLinear([[1]], [2], { tolerance: 1e-10 });
if (result.kind === 'unique') {
  const x: number[] = result.solution;
  void x;
}
// @ts-expect-error RHS entries are numbers
solveLinear([[1]], ['2']);
