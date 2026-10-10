---
"@formhaus/core": minor
---

- New `@formhaus/core/server` entry with `validateSubmission(definition, values, { skippedSteps })`. It returns the submit values and errors for a submitted payload.
- `validateSubmission()` drops unknown keys and values of hidden steps, hidden fields and skipped steps. It accepts a skip only for steps with `skip`.
- `validateSubmission()` rejects an invalid `email`, a non-numeric `number`, a choice outside `options`, and a non-boolean `checkbox` or `switch`, and a non-string value in a text field. Custom `validators` are ignored.
- New `@formhaus/core/server.iife.js` build exposes `validateSubmission` on a `Formhaus` global.
- Shared submission fixtures ship in `@formhaus/core/fixtures/submissions/*.json`.
