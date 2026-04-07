# Error Handling

After the user submits, the server might reject the data. Pass errors back to the form and it handles the display.

## Field-level errors

Pass a `{ fieldKey: message }` object. The error appears on the field and the form navigates to the step containing it.

::: code-group
```vue [Vue]
<script setup>
import { ref } from 'vue';

const serverErrors = ref({});

async function onSubmit(values) {
  try {
    await api.submitForm(values);
  } catch (err) {
    // Server returns: { email: "Already registered" }
    serverErrors.value = err.fieldErrors;
  }
}
</script>

<template>
  <FormRenderer
    :schema="schema"
    :errors="serverErrors"
    @submit="onSubmit"
  />
</template>
```

```tsx [React]
function MyForm() {
  const [errors, setErrors] = useState({});

  async function handleSubmit(values) {
    try {
      await api.submitForm(values);
    } catch (err) {
      // Server returns: { email: "Already registered" }
      setErrors(err.fieldErrors);
    }
  }

  return (
    <FormRenderer
      schema={schema}
      errors={errors}
      onSubmit={handleSubmit}
    />
  );
}
```
:::

In a multi-step form, if the error is on a field in step 1 and the user is on step 3, the form auto-navigates back to step 1.

## Top-level errors

If the server returns an error for a field that doesn't exist in the form (or is hidden), the error shows as a banner above the action buttons.

This handles cases like:
- Account suspended
- Rate limit exceeded
- Generic server errors

```ts
// Server returns an error for a non-existent field key
setErrors({ _general: 'Your account has been temporarily suspended.' });
```

The banner renders between the form fields and the Submit/Continue buttons.

## Loading state

Show a loading indicator on the submit button while the request is in flight:

::: code-group
```vue [Vue]
<FormRenderer
  :schema="schema"
  :loading="isSubmitting"
  @submit="onSubmit"
/>
```

```tsx [React]
<FormRenderer
  schema={schema}
  loading={isSubmitting}
  onSubmit={handleSubmit}
/>
```
:::

When `loading` is true, the submit button shows a spinner or is disabled.

## Field-level loading

Some fields load data asynchronously (e.g. looking up a value from an API). Use `setFieldLoading` on the engine:

::: code-group
```vue [Vue]
<script setup>
import { useFormEngine } from '@formhaus/vue';

const { engine } = useFormEngine(schema);

async function onFieldChange(key, value) {
  if (key === 'zipCode' && value.length === 5) {
    engine.setFieldLoading('city', true);
    const result = await lookupCity(value);
    engine.setValue('city', result.name);
    engine.setFieldLoading('city', false);
  }
}
</script>
```

```tsx [React]
const engine = useFormEngine(schema);

function onFieldChange(key, value) {
  if (key === 'zipCode' && value.length === 5) {
    engine.setFieldLoading('city', true);
    lookupCity(value).then(result => {
      engine.setValue('city', result.name);
      engine.setFieldLoading('city', false);
    });
  }
}
```
:::
