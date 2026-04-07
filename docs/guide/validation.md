# Validation

Validation runs when the user clicks Submit or Continue. No validation on blur.

## Built-in rules

All rules are optional. Combine them freely.

```json
{
  "key": "password",
  "type": "password",
  "label": "Password",
  "validation": {
    "required": true,
    "minLength": 8,
    "minLengthMessage": "Password must be at least 8 characters",
    "pattern": "(?=.*[A-Z])(?=.*[0-9])",
    "patternMessage": "Must include a number and uppercase letter"
  }
}
```

| Rule | Type | What it checks | Default message |
|------|------|---------------|-----------------|
| `required` | `boolean \| string` | Not empty (null, undefined, or "") | "This field is required" |
| `minLength` | `number` | String length >= value | "Must be at least N characters" |
| `maxLength` | `number` | String length <= value | "Must be at most N characters" |
| `min` | `number` | Number >= value | "Must be at least N" |
| `max` | `number` | Number <= value | "Must be at most N" |
| `pattern` | `string` | Matches regex | "Invalid format" |
| `matchField` | `string` | Value equals another field's value | "Fields must match" |
| `validator` | `string` | Custom validator function returns null | (your message) |

Every rule has a corresponding `...Message` field for custom error text. If you pass `required: "Please enter your name"`, that string is the error message.

## matchField

Useful for "confirm email" or "confirm password" fields. When either field changes, the match is re-evaluated.

```json
[
  {
    "key": "email",
    "type": "email",
    "label": "Email",
    "validation": { "required": true }
  },
  {
    "key": "confirmEmail",
    "type": "email",
    "label": "Confirm email",
    "validation": {
      "required": true,
      "matchField": "email",
      "matchFieldMessage": "Email addresses must match"
    }
  }
]
```

## Custom validators

For validation that can't be expressed in JSON (API checks, complex business rules), register a validator function:

::: code-group
```vue [Vue]
<FormRenderer
  :schema="schema"
  :validators="{ checkFormat: validateFormat }"
  @submit="onSubmit"
/>

<script setup>
function validateFormat(value, allValues) {
  if (!value) return null;
  return isValidFormat(value) ? null : 'Invalid format';
}
</script>
```

```tsx [React]
<FormRenderer
  schema={schema}
  validators={{ checkFormat: validateFormat }}
  onSubmit={handleSubmit}
/>

function validateFormat(value: unknown, allValues: Record<string, unknown>) {
  if (!value) return null;
  return isValidFormat(value as string) ? null : 'Invalid format';
}
```
:::

Reference the validator by name in the schema:

```json
{
  "key": "code",
  "type": "text",
  "label": "Code",
  "validation": { "validator": "checkFormat" }
}
```

## When validation runs

- **On Submit/Continue click:** All visible fields on the current step are validated.
- **Never on blur.** Fields don't show errors while the user is still filling them in.
- **Hidden fields are skipped.** If a field is hidden by a `show` condition, it's not validated.
- **Empty non-required fields are skipped.** `minLength`, `pattern`, etc. only run on non-empty values.
