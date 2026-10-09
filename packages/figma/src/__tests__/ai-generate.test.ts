import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkReply, generateDefinition } from '../ui/ai/generate';
import { SCHEMA_URL } from '../ui/ai/prompt';

const valid = { id: 'contact', title: 'Contact', submit: { label: 'Send' }, fields: [{ key: 'email', type: 'email', label: 'Email' }] };
const badRoute = {
  id: 'flow',
  title: 'Flow',
  submit: { label: 'Done' },
  steps: [{ id: 'one', title: 'One', fields: [], routes: [{ to: 'missing' }] }],
};

type Reply = { status?: number; body: unknown };

function mockFetch(...replies: Reply[]) {
  const fetch = vi.fn(async () => {
    const reply = replies.shift();
    if (!reply) throw new Error('Unexpected request');
    return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 });
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

const anthropic = (value: unknown): Reply => ({ body: { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }] } });
const openai = (value: unknown): Reply => ({ body: { choices: [{ message: { content: JSON.stringify(value) } }] } });
const sent = (fetch: ReturnType<typeof mockFetch>, call: number) => {
  const [url, init] = fetch.mock.calls[call] as unknown as [string, RequestInit];
  return { url, headers: init.headers as Record<string, string>, body: JSON.parse(init.body as string) };
};

afterEach(() => vi.unstubAllGlobals());

describe('checkReply', () => {
  it('accepts a valid definition and adds $schema', () => {
    expect(checkReply(JSON.stringify(valid))).toEqual({ definition: { $schema: SCHEMA_URL, ...valid }, errors: [] });
  });

  it('reports missing parts and engine errors', () => {
    expect(checkReply('{"title": "x"}').errors).toEqual(['"id" must be a non-empty string.', '"submit" must be an object with a "label".', 'Add "fields" or "steps".']);
    expect(checkReply(JSON.stringify(badRoute)).errors[0]).toContain('missing');
  });
});

describe('generateDefinition', () => {
  it('calls Anthropic from the browser with the key and returns the form', async () => {
    const fetch = mockFetch(anthropic(`Sure:\n${JSON.stringify(valid)}`));
    const result = await generateDefinition({ provider: 'anthropic', key: 'sk-test', description: 'Contact form' });
    expect(result).toEqual({ definition: { $schema: SCHEMA_URL, ...valid }, warnings: [] });
    const request = sent(fetch, 0);
    expect(request.url).toBe('https://api.anthropic.com/v1/messages');
    expect(request.headers).toMatchObject({ 'x-api-key': 'sk-test', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' });
    expect(request.body).toMatchObject({ model: 'claude-sonnet-5-5', messages: [{ role: 'user', content: 'Create this form:\nContact form' }] });
    expect(request.body.system).toContain('Formhaus');
  });

  it('asks OpenAI for a JSON object', async () => {
    const fetch = mockFetch(openai(valid));
    await generateDefinition({ provider: 'openai', key: 'sk-oa', description: 'Contact form' });
    const request = sent(fetch, 0);
    expect(request.url).toBe('https://api.openai.com/v1/chat/completions');
    expect(request.headers.authorization).toBe('Bearer sk-oa');
    expect(request.body.response_format).toEqual({ type: 'json_object' });
    expect(request.body.messages[0].role).toBe('system');
  });

  it('sends the errors back once and uses the repaired form', async () => {
    const fetch = mockFetch(anthropic(badRoute), anthropic(valid));
    const result = await generateDefinition({ provider: 'anthropic', key: 'k', description: 'Flow' });
    expect(result.definition.id).toBe('contact');
    const messages = sent(fetch, 1).body.messages;
    expect(messages).toHaveLength(3);
    expect(messages[1]).toEqual({ role: 'assistant', content: JSON.stringify(badRoute) });
    expect(messages[2].content).toContain('missing');
  });

  it('gives up after one repair round', async () => {
    const fetch = mockFetch(anthropic('no json'), anthropic(badRoute));
    await expect(generateDefinition({ provider: 'anthropic', key: 'k', description: 'Flow' })).rejects.toThrow('The generated form is not valid');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps the id of the form being edited', async () => {
    const fetch = mockFetch(anthropic({ ...valid, id: 'renamed' }));
    const current = { ...valid, id: 'canvas-form' };
    const result = await generateDefinition({ provider: 'anthropic', key: 'k', description: 'Add a name', current });
    expect(result.definition.id).toBe('canvas-form');
    expect(sent(fetch, 0).body.messages[0].content).toContain(JSON.stringify(current));
  });

  it('turns provider errors into readable messages', async () => {
    mockFetch({ status: 401, body: { type: 'error', error: { message: 'invalid x-api-key' } } });
    await expect(generateDefinition({ provider: 'anthropic', key: 'bad', description: 'x' })).rejects.toThrow('Check your API key (invalid x-api-key).');
    mockFetch({ status: 500, body: { error: { message: 'Overloaded' } } });
    await expect(generateDefinition({ provider: 'openai', key: 'k', description: 'x' })).rejects.toThrow('The provider returned an error: Overloaded');
  });

  it('stops when cancelled', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      controller.abort();
      throw init.signal?.reason;
    }));
    await expect(generateDefinition({ provider: 'anthropic', key: 'k', description: 'x', signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
});
