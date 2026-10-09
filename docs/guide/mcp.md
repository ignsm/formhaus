# MCP Server

`@formhaus/mcp` is an MCP server that lets AI agents check Formhaus definitions against the real engine. It runs over stdio and needs Node 20 or later.

## Setup

Claude Code:

```bash
claude mcp add formhaus -- npx -y @formhaus/mcp
```

Claude Desktop, in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "formhaus": {
      "command": "npx",
      "args": ["-y", "@formhaus/mcp"]
    }
  }
}
```

Cursor, in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "formhaus": {
      "command": "npx",
      "args": ["-y", "@formhaus/mcp"]
    }
  }
}
```

## Tools

| Tool | Input | Output |
|------|-------|--------|
| `validate_definition` | `definition` (object or JSON string) | `{ valid, errors, warnings, schemaChecked }` |
| `simulate_path` | `definition`, `answers`, optional `actions` (`next`, `back`, `skip`) | Active step path with visible fields, action trace, validation `errors`, `wouldSubmit`, `submitValues` |
| `capabilities` | none | Field types, field props, validation rules, condition operators, step and route semantics, adapters |
| `example_definitions` | optional `id` | List of bundled examples, or one definition |

Errors are problems the engine rejects, such as a missing `id` or a route to an earlier step. Warnings come from [`validateDefinition()`](/api/definition) and point to likely mistakes.

Without `actions`, `simulate_path` presses Next until the last step or the first validation error.

The capabilities are also available as the `formhaus://capabilities` resource.

## Example

`simulate_path` with the `branching-account` definition from `example_definitions` and these answers:

```json
{ "kind": "business", "company": "Acme" }
```

Output, without the `validation` report:

```json
{
  "ok": true,
  "multiStep": true,
  "path": [
    { "id": "kind", "title": "Choose an account type", "skipped": false, "visibleFields": ["kind"] },
    { "id": "business", "title": "Company details", "skipped": false, "visibleFields": ["company"] },
    { "id": "review", "title": "Review and submit", "skipped": false, "visibleFields": [] }
  ],
  "currentStep": { "id": "review", "title": "Review and submit", "index": 2 },
  "isLastStep": true,
  "trace": [
    { "action": "next", "from": "kind", "to": "business", "moved": true },
    { "action": "next", "from": "business", "to": "review", "moved": true }
  ],
  "errors": {},
  "wouldSubmit": true,
  "submitValues": { "kind": "business", "company": "Acme" }
}
```
