# Conditional Fields

Show or hide fields based on other field values. No code needed, just JSON.

## How it works

Add `show` or `showAny` to any field or step. The renderer re-evaluates visibility on every value change.

- `show`: AND logic. All conditions must match.
- `showAny`: OR logic. At least one condition must match.
- Both set: `(all show) AND (any showAny)`.
- Neither set: field is always visible.

Hidden fields are not validated and not included in submit values.

## Operators

| Operator | JSON key | Matches when |
|----------|----------|-------------|
| Equals | `eq` | Value equals the given value |
| Not equals | `neq` | Value does not equal |
| In list | `in` | Value is one of the listed values |
| Not in list | `notIn` | Value is not in the list |
| Not empty | `notEmpty` | Value is not null, undefined, or empty string |

## Example: show field when select changes

Show a details field only when category is "other":

```json
{
  "key": "otherDetails",
  "type": "text",
  "label": "Please specify",
  "show": [{ "field": "category", "eq": "other" }],
  "validation": { "required": true }
}
```

## Example: OR conditions

Show a field when payment method is credit card OR debit card:

```json
{
  "key": "cardNumber",
  "type": "text",
  "label": "Card Number",
  "showAny": [
    { "field": "paymentMethod", "eq": "credit" },
    { "field": "paymentMethod", "eq": "debit" }
  ]
}
```

Same thing, shorter with `in`:

```json
{
  "key": "cardNumber",
  "type": "text",
  "label": "Card Number",
  "show": [{ "field": "paymentMethod", "in": ["credit", "debit"] }]
}
```

## Example: AND + OR combined

Show a field when country is US AND method is credit or debit:

```json
{
  "key": "zipCode",
  "type": "text",
  "label": "Zip Code",
  "show": [{ "field": "country", "eq": "US" }],
  "showAny": [
    { "field": "method", "eq": "credit" },
    { "field": "method", "eq": "debit" }
  ]
}
```

## Hidden field cleanup

When a field becomes hidden, its value is cleared from the engine state immediately. This is intentional: you never submit data the user can't see.

If field A hides field B, and field B's value was used by field C's show condition, field C will also be re-evaluated. This cascades until stable (bounded by field count, max 50 iterations).

## Conditional steps

Steps support the same `show`/`showAny` conditions. A hidden step is skipped during navigation.

```json
{
  "id": "business-info",
  "title": "Business Information",
  "show": [{ "field": "accountType", "eq": "business" }],
  "fields": [
    { "key": "companyName", "type": "text", "label": "Company Name" }
  ]
}
```

If the user selects "personal" account type, this entire step disappears and the step counter updates.
