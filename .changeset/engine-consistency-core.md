---
"@formhaus/core": patch
---

- `required` on checkbox and switch fields rejects `false`.
- Changing an earlier answer that shows or hides another step no longer moves the user off the current step.
- A `matchField` error clears once the referenced field makes the values match.
- Continue clears stale errors on the current step after validation passes.
- Errors on fields that leave the active route path are cleared.
