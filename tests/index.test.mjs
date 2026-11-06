import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
function random(seed = 123456789) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('partial pivoting unique solution', () => {
  const r = lib.solveLinear(
    [
      [0, 2],
      [1, 1],
    ],
    [4, 3],
  );
  assert.equal(r.kind, 'unique');
  assert.deepEqual(r.solution, [1, 2]);
  assert.equal(r.rank, 2);
  assert.equal(r.residual, 0);
});
test('infinite affine family and null basis', () => {
  const r = lib.solveLinear(
    [
      [1, 2, 3],
      [2, 4, 6],
    ],
    [6, 12],
  );
  assert.equal(r.kind, 'infinite');
  assert.equal(r.rank, 1);
  assert.deepEqual(r.particular, [6, 0, 0]);
  assert.deepEqual(r.basis, [
    [-2, 1, 0],
    [-3, 0, 1],
  ]);
});
test('inconsistent including zero rows', () => {
  assert.deepEqual(
    lib.solveLinear(
      [
        [1, 2],
        [2, 4],
      ],
      [3, 7],
    ),
    { kind: 'inconsistent', rank: 1 },
  );
  assert.equal(lib.solveLinear([[0, 0]], [1]).kind, 'inconsistent');
  assert.equal(lib.solveLinear([[0, 0]], [0]).kind, 'infinite');
});
test('overdetermined and explicit tolerance', () => {
  assert.equal(lib.solveLinear([[1], [2], [3]], [2, 4, 6]).kind, 'unique');
  assert.equal(lib.solveLinear([[1e-12]], [0], { tolerance: 1e-10 }).kind, 'infinite');
  assert.equal(lib.solveLinear([[1e-12]], [1e-12], { tolerance: 1e-14 }).kind, 'unique');
});
test('validation ownership and exact cell limit', () => {
  const a = [[1]],
    b = [2];
  lib.solveLinear(a, b);
  assert.deepEqual(a, [[1]]);
  assert.throws(() => lib.solveLinear([[1], [1, 2]], [1, 2]), RangeError);
  assert.throws(() => lib.solveLinear([[Infinity]], [1]), RangeError);
  assert.throws(() => lib.solveLinear([[1]], [1], { maxCells: 1 }), RangeError);
  assert.equal(lib.solveLinear([[1]], [1], { maxCells: 2 }).kind, 'unique');
  assert.throws(() => lib.solveLinear([[1]], [1], { tolerance: 0 }), RangeError);
});
test('seeded exact Cramer oracle for 2x2 and known higher systems', () => {
  const rng = random();
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: 2 }, () =>
        Array.from({ length: 2 }, () => Math.floor(rng() * 15) - 7),
      ),
      b = [Math.floor(rng() * 19) - 9, Math.floor(rng() * 19) - 9],
      det = a[0][0] * a[1][1] - a[0][1] * a[1][0],
      r = lib.solveLinear(a, b);
    if (det !== 0) {
      assert.equal(r.kind, 'unique');
      const expected = [
        (b[0] * a[1][1] - a[0][1] * b[1]) / det,
        (a[0][0] * b[1] - b[0] * a[1][0]) / det,
      ];
      r.solution.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-8));
      assert.ok(r.residual < 1e-8);
    } else {
      const consistent =
        a[0][0] * b[1] === a[1][0] * b[0] &&
        a[0][1] * b[1] === a[1][1] * b[0] &&
        (a.flat().some(Boolean) || b.every((x) => x === 0));
      assert.equal(r.kind, consistent ? 'infinite' : 'inconsistent');
    }
  }
  for (let t = 0; t < 30; t++) {
    const n = 6,
      x = Array.from({ length: n }, () => Math.floor(rng() * 20) - 10),
      a = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 40 : Math.floor(rng() * 7) - 3)),
      ),
      b = a.map((row) => row.reduce((s, v, j) => s + v * x[j], 0)),
      r = lib.solveLinear(a, b);
    assert.equal(r.kind, 'unique');
    r.solution.forEach((v, i) => assert.ok(Math.abs(v - x[i]) < 1e-8));
  }
});
