import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import packageJson from '../package.json';
import { capabilities, capabilitiesTool } from './capabilities';
import { definitionInput } from './definition-input';
import { exampleDefinitionsTool } from './examples';
import { simulatePathTool } from './simulate';
import { validateDefinitionTool } from './validate';

const CAPABILITIES_URI = 'formhaus://capabilities';

function json(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: 'formhaus', version: packageJson.version });

  server.registerTool('validate_definition', {
    title: 'Validate a Formhaus definition',
    description: 'Checks a Formhaus form definition. Returns { valid, errors, warnings, schemaChecked }. Errors make the engine reject the definition; warnings point to likely mistakes such as conditions on unknown fields, invalid regex, circular conditions or branches that fall through.',
    inputSchema: { definition: definitionInput },
    annotations: { readOnlyHint: true },
  }, async (input) => json(await validateDefinitionTool(input)));

  server.registerTool('simulate_path', {
    title: 'Simulate a path through a form',
    description: 'Runs a headless FormEngine with the given answers and navigation actions. Without actions it presses Next until the last step or a validation error. Returns the active step path with visible fields, the trace of each action, validation errors, whether the form would submit, and the submit payload. Use it to check branching, routes, skip and conditional fields.',
    inputSchema: {
      definition: definitionInput,
      answers: z.record(z.string(), z.unknown()).optional().describe('Field values keyed by field key.'),
      actions: z.array(z.enum(['next', 'back', 'skip'])).optional().describe('Navigation actions applied in order.'),
    },
    annotations: { readOnlyHint: true },
  }, async (input) => json(await simulatePathTool(input)));

  server.registerTool('capabilities', {
    title: 'Formhaus capabilities',
    description: 'Lists what a Formhaus definition supports: field types, field props, validation rules, condition operators, step and route semantics, actions and adapters.',
    annotations: { readOnlyHint: true },
  }, async () => json(capabilitiesTool()));

  server.registerTool('example_definitions', {
    title: 'Example definitions',
    description: 'Without id, lists the bundled example definitions. With id, returns that definition.',
    inputSchema: { id: z.string().optional().describe('Example id from the list.') },
    annotations: { readOnlyHint: true },
  }, async (input) => json(exampleDefinitionsTool(input)));

  server.registerResource('capabilities', CAPABILITIES_URI, {
    title: 'Formhaus capabilities',
    description: 'Field types, validation rules, conditions and step semantics of Formhaus definitions.',
    mimeType: 'application/json',
  }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(capabilities, null, 2) }] }));

  return server;
}
