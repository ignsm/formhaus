import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudError, createSubmitter, fetchDefinition, findSkippedSteps } from '../../src/cloud';
import type { FormDefinition } from '../../src';

const definition: FormDefinition = {
  id: 'wizard',
  title: 'Wizard',
  submit: { label: 'Send' },
  steps: [
    { id: 'one', title: 'One', fields: [{ key: 'name', type: 'text', label: 'Name' }] },
    { id: 'two', title: 'Two', skip: { label: 'Skip' }, fields: [{ key: 'bio', type: 'text', label: 'Bio' }] },
  ],
};

function reply(status: number, body: unknown) {
  return { ok: status < 400, status, json: async () => body };
}

afterEach(() => vi.unstubAllGlobals());

describe('cloud client', () => {
  it('fetches the definition from the api base', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, definition));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchDefinition({ id: 'abc', apiBase: 'https://example.test/' })).resolves.toEqual(definition);
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.test/f/abc/definition');
  });

  it('throws a CloudError with the response code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(410, { error: 'form_closed' })));
    await expect(fetchDefinition({ id: 'abc' })).rejects.toMatchObject({ status: 410, code: 'form_closed' });
  });

  it('reuses the idempotency key for the same body and rotates it for a new one', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply(429, { error: 'rate_limited' }))
      .mockResolvedValueOnce(reply(201, { id: 's1', values: {} }))
      .mockResolvedValue(reply(201, { id: 's2', values: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const submit = createSubmitter({ id: 'abc' });
    await expect(submit(definition, { name: 'Ada' })).rejects.toBeInstanceOf(CloudError);
    await submit(definition, { name: 'Ada' });
    await submit(definition, { name: 'Ada' });
    const keys = fetchMock.mock.calls.map(([, init]) => init.headers['Idempotency-Key']);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[1]);
  });

  it('exposes field errors from a 422', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(422, { errors: { name: 'Required' } })));
    await expect(createSubmitter({ id: 'abc' })(definition, {})).rejects.toMatchObject({ status: 422, errors: { name: 'Required' } });
  });

  it('lists skippable steps whose fields are absent from the values', () => {
    expect(findSkippedSteps(definition, { name: 'Ada' })).toEqual(['two']);
    expect(findSkippedSteps(definition, { name: 'Ada', bio: '' })).toEqual([]);
  });
});
