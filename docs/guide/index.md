# Getting Started

Render forms from JSON. One schema drives Vue, React, and (eventually) Swift.

Instead of hand-building each form per platform, you describe the form in JSON and let the renderer do the work.

## Quick start

::: code-group
```vue [Vue]
<script setup>
import { FormRenderer } from '@formhaus/vue';
import schema from '@formhaus/core/fixtures/basic-form.json';

function onSubmit(values) {
  console.log(values);
}
</script>

<template>
  <FormRenderer :schema="schema" @submit="onSubmit" />
</template>
```

```tsx [React]
import { FormRenderer } from '@formhaus/react';
import schema from '@formhaus/core/fixtures/basic-form.json';

function MyForm() {
  return (
    <FormRenderer
      schema={schema}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```
:::

That's it. The renderer reads the schema, renders the right field components, handles validation, and gives you the values on submit.

## How it works

```
JSON Schema --> FormEngine (pure TS) --> Adapter --> UI Components
                     |
                     |-- values, errors, step state
                     |-- visibility (show/hide fields)
                     |-- validation (required, pattern, etc.)
                     +-- subscribe/getSnapshot (React)
                         computed refs (Vue)
```

Three packages:

| Package | What it does | Dependencies |
|---------|-------------|--------------|
| `@formhaus/core` | Types, validation, visibility, FormEngine class | None (pure TS) |
| `@formhaus/vue` | Vue adapter with default HTML field components | @formhaus/core |
| `@formhaus/react` | React adapter with default HTML field components | @formhaus/core |

The engine is framework-agnostic. It holds the form state, runs validation, tracks which fields are visible, and manages step navigation. The adapters are thin wrappers that connect the engine to framework-specific reactivity and render the right UI components.

## Packages

### @formhaus/core

Pure TypeScript. Zero framework deps. Contains:
- Type definitions for the JSON schema
- `FormEngine` class (state machine for the form)
- Visibility evaluation (`show`/`showAny` conditions)
- Validation (built-in rules + custom validators)
- Schema validation (DAG cycle detection for show conditions)

### Vue adapter

`@formhaus/vue` -- uses default HTML form elements (input, select, checkbox, etc.) out of the box. Override any field type with your own components via the `components` prop.

### React adapter

`@formhaus/react` -- uses default HTML form elements out of the box. Same structure as the Vue adapter. Override any field type with your own components via the `components` prop.
