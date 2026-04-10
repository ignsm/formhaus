# Changelog

## 0.3.1 - 2026-04-10

### Build

- `@formhaus/core` and `@formhaus/react` now build to a single bundled ESM file via `tsup` instead of `tsc` directory output. The previous `tsc` output used extension-less relative imports that broke under strict Node ESM resolution — Bundlephobia couldn't follow the re-exports and was displaying ~500 bytes for `@formhaus/core` instead of the real size. Current sizes: `@formhaus/core` 2.87 KB gzipped, `@formhaus/react` 3.15 KB gzipped.
- Added `"sideEffects": false` to `@formhaus/core` and `@formhaus/react`, and `"sideEffects": ["**/*.vue", "**/*.css"]` to `@formhaus/vue` for better consumer tree-shaking.
- Reordered `exports` field so `types` comes before `import`, matching TypeScript's resolution rules.
- New `test:resolve` script in core and react runs the built `dist/index.js` through Node's strict ESM resolver in CI as a regression guard.

### Docs

- Dropped leftover "JSON-schema-driven" wording from the four package `description` fields and removed `json-schema` from `@formhaus/core` keywords, finishing the terminology cleanup started in 0.3.0.

## 0.3.0 - 2026-04-07

### Docs

- Replaced "JSON schema" terminology with "form definition" across all docs, README, and CONTRIBUTING to avoid confusion with the JSON Schema spec.
- Renamed `/form-schema` skill to `/formhaus-create-form`.
- Renamed `/figma-connect` skill to `/formhaus-figma-connect`.
- Renamed `docs/api/schema.md` to `docs/api/definition.md`.
- Added "Nested keys" section to field types guide.
- Added "Schema improvements (non-urgent)" section to CONTRIBUTING.

### `@formhaus/core`

- `FieldType` now accepts any string. Built-in types get autocomplete via `DefaultFieldType`.
- `multiselect` validation: empty arrays are empty, `minLength`/`maxLength` check selection count.
- `setErrors()` now replaces all previous errors instead of merging.
- `validateSchema()` detects duplicate field keys and invalid regex patterns.
- Cascade clearing now respects step-level visibility.
- Getter caching: `visibleSteps`, `visibleFields`, `currentStep`, `canGoNext` recompute only when state changes, not on every access.
- `minLength`/`maxLength` validation messages now say "items" instead of "characters" for array values.

### `@formhaus/react`

- **Breaking:** CSS class `fh-form-actions__btn` renamed to `fh-form-actions__button`.
- **Breaking:** CheckboxField, RadioField, SwitchField structure and class names aligned with Vue.
- New `MultiselectField` component (checkbox group).
- `optionsProviders` prop for dynamic field options via `optionsFrom`.
- `onAnalyticsEvent` prop fires on focus, blur, error, step change, and submit.
- `FieldComponentProps` now includes `onFocus`.
- Submit button evaluates `FormAction.disabled` conditions.
- `mask` field shown as placeholder fallback in TextField.
- `useFormEngine` recreates engine when `schema.id` changes.
- `useFieldOptions` now handles rejected async providers and avoids redundant calls.

### `@formhaus/vue`

- **Breaking:** All scoped styles removed. Components are now unstyled by default.
- New `MultiselectField` component (checkbox group).
- `optionsProviders` prop wired up for dynamic field options.
- `analyticsEvent` emit fires on focus, blur, error, step change, and submit.
- Field components now emit `focus`.
- `useFormEngine` accepts getter, recreates engine when `schema.id` changes.
- `useFieldOptions` now handles rejected async providers and avoids redundant calls.
- Submit button evaluates `FormAction.disabled` conditions.
- `mask` field shown as placeholder fallback in TextField.
- Removed unused `actions` prop from FormRenderer.

## 0.2.1 - 2026-04-07

### `@formhaus/react`

- `FormActionsProps` now includes optional `primaryLabel`, `showBack`, `backLabel`, `onPrimary`. Custom `ActionsComponent` can use these instead of re-deriving step-navigation logic from raw props.
- `FormStep.next.label` is now respected as the "Continue" button label on intermediate steps. Previously hardcoded to "Continue".

### `@formhaus/vue`

- `FormActionsProps` now includes optional `primaryLabel`, `showBack`, `backLabel`. Custom `actionsComponent` can use these instead of re-deriving step-navigation logic.
- New `primary` emit for unified primary button handling.
- `FormStep.next.label` is now respected as the "Continue" button label on intermediate steps. Previously hardcoded to "Continue".

## 0.2.0 - 2026-04-07

### `@formhaus/react`

- `ActionsComponent` prop on `FormRenderer` to replace the default form buttons.
- `ProgressComponent` prop on `FormRenderer` to replace the default step progress bar.
- Exported `FormActionsProps` and `FormStepProgressProps` types.

### `@formhaus/vue`

- `actionsComponent` prop on `FormRenderer` to replace the default form buttons.
- `progressComponent` prop on `FormRenderer` to replace the default step progress bar.
- Exported `FormActionsProps` and `FormStepProgressProps` types.

## 0.1.2 - 2026-04-07

### `@formhaus/vue`

- Fixed missing `.d.ts` files in published dist.

## 0.1.0 - 2026-04-07

### `@formhaus/core`

- Form engine, types, validation, visibility, conditional fields.

### `@formhaus/react`

- React adapter with native HTML field components.

### `@formhaus/vue`

- Vue 3 adapter with native HTML field components.

### `@formhaus/figma`

- Figma plugin with configurable component map.
