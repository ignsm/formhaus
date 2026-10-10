import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FormDefinition } from '@formhaus/core';
import { afterEach, expect, it, vi } from 'vitest';
import { FormhausForm } from '../src/cloud';

const definition: FormDefinition = { id: 'contact', title: 'Contact', submit: { label: 'Send' },
  fields: [{ key: 'email', type: 'text', label: 'Email', validation: { required: true } }] };

function reply(status: number, body: unknown) {
  return { ok: status < 400, status, json: async () => body };
}

function stubApi(...submitReplies: ReturnType<typeof reply>[]) {
  const submits = [...submitReplies];
  const fetchMock = vi.fn(async (url: string, init?: { method?: string }) => (
    init?.method === 'POST' ? submits.shift()! : reply(200, definition)
  ));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function posts(fetchMock: ReturnType<typeof stubApi>) {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST') as unknown as [string, { headers: Record<string, string>; body: string }][];
}

async function fillAndSend(value: string) {
  fireEvent.change(await screen.findByRole('textbox'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
}

afterEach(() => vi.unstubAllGlobals());

it('renders the fetched definition', async () => {
  const fetchMock = stubApi();
  render(<FormhausForm id="abc" apiBase="https://example.test" />);
  expect(await screen.findByText('Email')).toBeDefined();
  expect(fetchMock.mock.calls[0][0]).toBe('https://example.test/f/abc/definition');
});

it('shows an error when the definition cannot be loaded', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => reply(410, { error: 'form_closed' })));
  const onError = vi.fn();
  render(<FormhausForm id="abc" onError={onError} />);
  expect((await screen.findByRole('alert')).textContent).toBe('This form no longer accepts submissions.');
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ status: 410, code: 'form_closed' }));
});

it('posts values and reports the submission', async () => {
  const fetchMock = stubApi(reply(201, { id: 's1', values: { email: 'a@b.co' } }));
  const onSuccess = vi.fn();
  render(<FormhausForm id="abc" onSuccess={onSuccess} />);
  await fillAndSend('a@b.co');
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 's1', values: { email: 'a@b.co' } }));
  expect(JSON.parse(posts(fetchMock)[0][1].body)).toEqual({ values: { email: 'a@b.co' }, skippedSteps: [] });
  expect(screen.getByRole('status')).toBeDefined();
});

it('maps 422 errors onto fields', async () => {
  stubApi(reply(422, { errors: { email: 'Already registered' } }));
  const onSuccess = vi.fn();
  render(<FormhausForm id="abc" onSuccess={onSuccess} />);
  await fillAndSend('a@b.co');
  expect(await screen.findByText('Already registered')).toBeDefined();
  expect(onSuccess).not.toHaveBeenCalled();
});

it('reuses the idempotency key when retrying the same body', async () => {
  const fetchMock = stubApi(reply(429, { error: 'rate_limited' }), reply(201, { id: 's1', values: {} }));
  render(<FormhausForm id="abc" />);
  await fillAndSend('a@b.co');
  expect(await screen.findByText('Too many submissions. Try again shortly.')).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(posts(fetchMock)).toHaveLength(2));
  const [first, second] = posts(fetchMock).map(([, init]) => init.headers['Idempotency-Key']);
  expect(first).toBeTruthy();
  expect(second).toBe(first);
});
