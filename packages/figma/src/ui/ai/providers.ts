import type { ChatMessage } from './prompt';

export type ProviderId = 'anthropic' | 'openai';

interface Provider {
  url: string;
  model: string;
  headers(key: string): Record<string, string>;
  body(system: string, messages: ChatMessage[]): unknown;
  text(data: any): string;
}

export const PROVIDERS: Record<ProviderId, Provider> = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-5-5',
    headers: (key) => ({
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    body(system, messages) {
      return { model: this.model, max_tokens: 8192, system, messages };
    },
    text: (data) => (data?.content ?? []).filter((part: any) => part?.type === 'text').map((part: any) => part.text).join(''),
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-6.1-sol',
    headers: (key) => ({ 'content-type': 'application/json', authorization: `Bearer ${key}` }),
    body(system, messages) {
      return { model: this.model, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, ...messages] };
    },
    text: (data) => data?.choices?.[0]?.message?.content ?? '',
  },
};

function errorText(status: number, data: any): string {
  const detail = data?.error?.message;
  if (status === 401 || status === 403) return `Check your API key${detail ? ` (${detail})` : ''}.`;
  if (status === 429) return `Rate limit or quota reached${detail ? `: ${detail}` : '.'}`;
  return detail ? `The provider returned an error: ${detail}` : `The provider returned HTTP ${status}.`;
}

export async function complete(id: ProviderId, key: string, system: string, messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  const provider = PROVIDERS[id];
  let response: Response;
  try {
    response = await fetch(provider.url, { method: 'POST', headers: provider.headers(key), body: JSON.stringify(provider.body(system, messages)), signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Could not reach the provider. Check your connection.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorText(response.status, data));
  const text = provider.text(data);
  if (!text) throw new Error('The provider returned an empty reply.');
  return text;
}
