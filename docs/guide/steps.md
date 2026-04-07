# Multi-Step Forms

Split a form into steps. The renderer handles navigation, progress indicator, and per-step validation.

## Basic multi-step

Use `steps` instead of `fields` in the schema:

```json
{
  "id": "account-setup",
  "title": "Account Setup",
  "submit": { "label": "Create Account" },
  "steps": [
    {
      "id": "personal",
      "title": "Personal Information",
      "description": "Tell us about yourself",
      "fields": [
        { "key": "name", "type": "text", "label": "Full name", "validation": { "required": true } },
        { "key": "email", "type": "email", "label": "Email", "validation": { "required": true } }
      ]
    },
    {
      "id": "address",
      "title": "Address",
      "fields": [
        { "key": "street", "type": "text", "label": "Street", "validation": { "required": true } },
        { "key": "city", "type": "text", "label": "City", "validation": { "required": true } }
      ]
    },
    {
      "id": "confirm",
      "title": "Confirm",
      "fields": [
        { "key": "terms", "type": "checkbox", "label": "I accept the terms", "validation": { "required": "You must accept" } }
      ]
    }
  ]
}
```

## Navigation behavior

- **Continue** validates the current step. If valid, moves to the next visible step. If invalid, shows errors.
- **Back** goes to the previous visible step. No validation.
- **Submit** appears on the last visible step instead of Continue.
- **Progress bar** shows "Step N of M" based on visible steps.

## Custom CTA per step

Override the Continue or Back button text/style on any step:

```json
{
  "id": "review",
  "title": "Review & Send",
  "back": { "label": "Edit Details", "variant": "text" },
  "fields": [...]
}
```

Set `back` to `false` to hide the Back button on a step:

```json
{
  "id": "first-step",
  "title": "Welcome",
  "back": false,
  "fields": [...]
}
```

## Conditional steps

Steps support `show`/`showAny` conditions, same as fields. A hidden step is skipped during navigation and its fields are not validated or submitted.

```json
{
  "id": "business-info",
  "title": "Business Details",
  "show": [{ "field": "accountType", "eq": "business" }],
  "fields": [
    { "key": "companyName", "type": "text", "label": "Company name" },
    { "key": "taxId", "type": "text", "label": "Tax ID" }
  ]
}
```

When the user picks "personal" instead of "business," this step vanishes. The progress bar updates from "Step 2 of 4" to "Step 2 of 3." The user never sees it.

## Step change callback

::: code-group
```vue [Vue]
<FormRenderer
  :schema="schema"
  @step-change="(stepId, direction) => console.log(stepId, direction)"
  @submit="onSubmit"
/>
```

```tsx [React]
<FormRenderer
  schema={schema}
  onStepChange={(stepId, direction) => console.log(stepId, direction)}
  onSubmit={handleSubmit}
/>
```
:::

`direction` is `'next'` or `'back'`.

## getSubmitValues

On submit, all visible fields across all visible steps are returned. Fields in hidden steps are not included. This means the submit payload only contains data the user actually saw and confirmed.
