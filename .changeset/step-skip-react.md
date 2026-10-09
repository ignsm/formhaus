---
"@formhaus/react": minor
---

- `FormActions` renders a Skip button on steps with `skip`. New `skipAction`, `showSkip`, `skipLabel` and `onSkip` props.
- Back renders with `fh-form-actions__button--secondary` instead of `--text`.
- Back, Skip and Cancel use `variant` from their action when it is set.
- `onAnalyticsEvent` receives `step_skipped` instead of `step_completed` for a skipped step.
