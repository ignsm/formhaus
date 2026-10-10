import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { cloudRequest } from './cloud-client';
import { definitionInput } from './definition-input';

function result({ ok, body }: { ok: boolean; body: unknown }) {
  return { isError: !ok, content: [{ type: 'text' as const, text: JSON.stringify(body, null, 2) }] };
}

export function registerCloudTools(server: McpServer): void {
  server.registerTool('publish_form', {
    title: 'Publish a form',
    description: 'Publishes a Formhaus form definition to Formhaus Cloud and returns a live submission endpoint, a hosted page URL, an embed snippet and a React snippet (form_id, version, endpoint, hosted_url, embed_snippet, react_snippet, dashboard_url, warnings). Validate the definition with validate_definition first. Without FORMHAUS_API_KEY the form is unclaimed (7 days, 100 submissions) and the result has claim_url for the user. With a key, pass form_id to publish a new version of a form the key owns; the endpoint stays the same. Hosted forms do not support password, file, autocomplete, optionsFrom or custom field types. Limits: 32 KB and 100 fields per definition. On error, fix every listed path and retry.',
    inputSchema: {
      definition: definitionInput,
      form_id: z.string().optional().describe('Publish a new version of this existing form. Requires FORMHAUS_API_KEY.'),
      email: z.string().optional().describe('Only without an API key: the user email that receives the claim link.'),
      success_message: z.string().max(500).optional().describe('Text shown after a successful submission on the hosted page and embed.'),
      redirect_url: z.string().optional().describe('http(s) URL to open after a successful submission instead of the success message. Empty string removes it.'),
    },
    annotations: { readOnlyHint: false, openWorldHint: true },
  }, async (input) => result(await cloudRequest('/v1/forms', { method: 'POST', body: input, auth: 'optional' })));

  server.registerTool('list_forms', {
    title: 'List forms',
    description: 'Lists the forms of the Formhaus Cloud account that owns FORMHAUS_API_KEY, newest first, with status, latest version, submission count, endpoint and hosted_url. Use it to find a form_id before get_submissions or before publishing a new version with publish_form. Requires FORMHAUS_API_KEY.',
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async () => result(await cloudRequest('/v1/forms', { auth: 'required' })));

  server.registerTool('get_submissions', {
    title: 'Get form submissions',
    description: 'Reads the submissions of a form owned by FORMHAUS_API_KEY, newest first. Each submission has id, created_at, form_version and values (field key to value, already validated on the server). When the result has next_cursor, call again with cursor set to it to read older submissions. Requires FORMHAUS_API_KEY.',
    inputSchema: {
      form_id: z.string().describe('The form_id returned by publish_form or list_forms.'),
      limit: z.number().int().min(1).max(100).optional().describe('Page size from 1 to 100. Default 50.'),
      cursor: z.string().optional().describe('next_cursor from the previous call. Omit for the newest submissions.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ form_id, limit, cursor }) => {
    const query = new URLSearchParams();
    if (limit !== undefined) query.set('limit', String(limit));
    if (cursor !== undefined) query.set('cursor', cursor);
    const suffix = query.size > 0 ? `?${query}` : '';
    return result(await cloudRequest(`/v1/forms/${encodeURIComponent(form_id)}/submissions${suffix}`, { auth: 'required' }));
  });
}
