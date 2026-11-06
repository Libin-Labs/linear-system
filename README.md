# @lp-labs/linear-system

Rank-aware Gaussian elimination with partial pivoting for finite real systems. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes with BigInt where used. No browser globals accessed at import.

## Install

```sh
npm install @lp-labs/linear-system
```

## Quick start

```js
import { solveLinear } from '@lp-labs/linear-system';
console.log(
  solveLinear(
    [
      [2, 1],
      [1, -1],
    ],
    [5, 1],
  ),
);
// unique solution [2,1], residual 0
```

ES modules use named imports above. CommonJS uses `const { solveLinear } = require('@lp-labs/linear-system');`. Both formats ship declarations.

## Public API and customization

- `LinearOptions`: `tolerance?` positive absolute pivot/inconsistency threshold (default 1e-10), `maxCells?` default 100,000, maximum 1,000,000.
- `LinearResult`: discriminated by `kind`: unique has `rank, solution, residual`; infinite has `rank, particular, basis, residual`; inconsistent has `rank`.
- `solveLinear(matrix,rhs,options?): LinearResult`: finite rectangular coefficient matrix and right-hand side. Partial-pivot Gauss-Jordan elimination. Free variables set to zero for particular solution; basis ordered by free column. Residual is infinity norm of A*x-b in original coordinates.

All runtime exports and public declaration types are listed above. Options are per call/instance; no global configuration.

## Errors, ownership and limits

1..256 rows/columns, augmented cell count m(n+1) bounded before allocation. O(mn min(m,n)) time, O(mn+n²) storage including basis. RangeError for invalid dimensions/options/finite values, cell excess or nonfinite intermediate arithmetic. Inputs copied. Rank and consistency are numerical classifications under absolute tolerance, scale-sensitive and not exact algebra. No condition estimate, relative-error guarantee or promise for ill-conditioned systems; inspect residual, rescale inputs and adjust tolerance. Basis is approximate and residual reports only particular/unique solution.

Algorithms are synchronous and CPU/memory bounded by the stated limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, callbacks or infinite iterables. TypeScript signatures are the supported input contract. No I/O, network, persistence or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript, ESM/CommonJS, bare installed-package consumers with negative type assertions, and deterministic reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
