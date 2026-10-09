---
"@formhaus/core": minor
---

- New `skip` step option. A skipped step resets to its defaults and is left out of submit validation and submitted values.
- New `skipStep()`, `skipStepAsync()` and `isStepSkipped()` methods. `skipStepAsync(submit)` submits when the skipped step is the last one.
- `StepChangeContext.reason` can be `'skip'`.
- New `step_skipped` analytics event type.
- `validateDefinition()` warns about `skip` on a single-step form or a step with `next: false`.
