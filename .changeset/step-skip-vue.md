---
"@formhaus/vue": minor
---

- `FormActions` renders a Skip button on steps with `skip` and emits `skip`. New `skipAction`, `showSkip` and `skipLabel` props.
- Back renders with `fh-form-actions__button--secondary` instead of `--text`.
- `analyticsEvent` emits `step_skipped` instead of `step_completed` for a skipped step.
