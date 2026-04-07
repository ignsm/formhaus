# Changelog

All notable changes to `@formhaus/react` and `@formhaus/vue` are documented here.

## 0.2.1

### Added

- **Computed action props**: `FormActionsProps` now includes optional `primaryLabel`, `showBack`, `backLabel` (both packages) and `onPrimary` (React) / `primary` emit (Vue). Custom `ActionsComponent` can use these pre-computed values instead of re-deriving step-navigation logic from raw props.
- `FormStep.next.label` is now respected as the "Continue" button label on intermediate steps. Previously hardcoded to "Continue".

### Fixed

- Custom components docs: raw props table now includes all available props.

## 0.2.0

### Added

- Customizable `ActionsComponent` / `actionsComponent` prop on `FormRenderer` to replace the default form buttons with your own component.
- Customizable `ProgressComponent` / `progressComponent` prop on `FormRenderer` to replace the default step progress bar.
- Exported `FormActionsProps` and `FormStepProgressProps` types for typing custom components.
- Custom Actions & Progress documentation page.

## 0.1.2

### Fixed

- (vue) Missing `.d.ts` files in published dist.

## 0.1.1

### Fixed

- (core) Console type declaration for universal builds.
- (react) Use `field.validation.required` instead of `field.required`.

## 0.1.0

### Added

- `@formhaus/core`: form engine, types, validation, visibility, conditional fields.
- `@formhaus/react`: React adapter with native HTML field components.
- `@formhaus/vue`: Vue 3 adapter with native HTML field components.
- `@formhaus/figma`: Figma plugin with configurable component map.
- Claude skills: `/form-schema` for JSON schema generation, `/figma-connect` for component map generation.
- VitePress documentation site.
