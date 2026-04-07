# Field Types

Each field `type` maps to a UI component. The default adapters use native HTML elements. You can override any field type with your own component via the `components` prop.

## Text fields

Types `text`, `email`, `phone`, `number`, `password` all render a text input. The `type` controls the HTML input type and keyboard on mobile.

```json
{
  "key": "email",
  "type": "email",
  "label": "Email address",
  "placeholder": "you@example.com",
  "validation": {
    "required": true,
    "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    "patternMessage": "Enter a valid email"
  }
}
```

Use `inputMode` to control the mobile keyboard without changing the field type:

```json
{
  "key": "zipCode",
  "type": "text",
  "label": "Zip code",
  "inputMode": "numeric",
  "validation": { "pattern": "^[0-9]{5}$" }
}
```

## Select

Dropdown with predefined options. Options are defined inline or loaded dynamically.

```json
{
  "key": "country",
  "type": "select",
  "label": "Country",
  "placeholder": "Select a country",
  "options": [
    { "value": "US", "label": "United States" },
    { "value": "DE", "label": "Germany" },
    { "value": "JP", "label": "Japan" }
  ],
  "validation": { "required": true }
}
```

For dynamic options (e.g. loading data from an API), use `optionsFrom`:

```json
{
  "key": "category",
  "type": "select",
  "label": "Category",
  "optionsFrom": "categories",
  "optionsDependsOn": ["type"]
}
```

Then pass the provider to the renderer:

::: code-group
```vue [Vue]
<FormRenderer
  :schema="schema"
  :options-providers="{ categories: loadCategories }"
  @submit="onSubmit"
/>
```

```tsx [React]
<FormRenderer
  schema={schema}
  optionsProviders={{ categories: loadCategories }}
  onSubmit={handleSubmit}
/>
```
:::

## Checkbox

Single boolean toggle with a label.

```json
{
  "key": "termsAccepted",
  "type": "checkbox",
  "label": "I accept the Terms of Service",
  "validation": { "required": "You must accept the terms" }
}
```

## Radio

Single selection from a list of options. Options render vertically.

```json
{
  "key": "accountType",
  "type": "radio",
  "label": "Account type",
  "options": [
    { "value": "personal", "label": "Personal" },
    { "value": "business", "label": "Business" }
  ],
  "validation": { "required": true }
}
```

## Switch

Boolean toggle, styled as a switch. Same behavior as checkbox but different UI.

```json
{
  "key": "darkMode",
  "type": "switch",
  "label": "Dark mode"
}
```

## Textarea

Multi-line text input. Set `rows` to control the height.

```json
{
  "key": "description",
  "type": "textarea",
  "label": "Description",
  "helperText": "Provide additional details",
  "rows": 4,
  "validation": { "required": true, "minLength": 20 }
}
```

## Date

Date picker. Uses native `<input type="date">` as a fallback until a custom date picker component is available.

```json
{
  "key": "birthDate",
  "type": "date",
  "label": "Date of birth"
}
```

## File

File upload. Uses native file input. Set `accept` to restrict file types.

```json
{
  "key": "document",
  "type": "file",
  "label": "Upload document",
  "accept": "image/*,.pdf"
}
```

## Custom field components

Override the default component for any field type by passing a `components` prop:

::: code-group
```vue [Vue]
<FormRenderer
  :schema="schema"
  :components="{ phone: CustomPhoneInput }"
  @submit="onSubmit"
/>
```

```tsx [React]
<FormRenderer
  schema={schema}
  components={{ phone: CustomPhoneInput }}
  onSubmit={handleSubmit}
/>
```
:::

Your custom component receives the same props as the built-in field components: `field`, `value`, `error`, `loading`, `disabled`, plus `onChange`/`onBlur` callbacks.
