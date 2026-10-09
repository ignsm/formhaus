import type { FormDefinition, FormStep } from '@formhaus/core';
import { describe, expect, it } from 'vitest';
import { stepButtons } from '../render-form';
import { setBackLabel, setBackVisible, setCancel, setNextLabel, setNextVisible } from '../ui/editor/actions';

const definition = (): FormDefinition => ({ id: 'f', title: 'Quiz', submit: { label: 'Finish' }, steps: [] });
const step = (extra: Partial<FormStep> = {}): FormStep => ({ id: 's', title: 'S', fields: [], ...extra });

describe('step buttons in Figma', () => {
  it('uses custom labels, hides false actions and shows cancel on every step', () => {
    const form = { ...definition(), cancel: { label: 'Close' } };
    expect(stepButtons(form, step({ next: { label: 'Next question' } }), true, false, true)).toEqual({ primary: 'Next question', back: null, cancel: 'Close' });
    expect(stepButtons(form, step({ back: { label: 'Previous' } }), false, false, true)).toEqual({ primary: 'Continue', back: 'Previous', cancel: 'Close' });
    expect(stepButtons(form, step({ next: false, back: false }), false, false, true)).toEqual({ primary: null, back: null, cancel: 'Close' });
    expect(stepButtons(definition(), step({ next: false }), false, true, true)).toEqual({ primary: 'Finish', back: 'Back', cancel: null });
  });
});

describe('editing step buttons', () => {
  it('keeps other action settings and falls back to defaults when cleared', () => {
    const current = step({ next: { label: 'Go', variant: 'secondary' } });
    setNextLabel(current, 'Next');
    expect(current.next).toEqual({ label: 'Next', variant: 'secondary' });
    setNextLabel(current, '');
    expect(current.next).toEqual({ label: 'Continue', variant: 'secondary' });
    const plain = step();
    setBackLabel(plain, 'Previous');
    setBackLabel(plain, '');
    expect(plain.back).toBeUndefined();
  });

  it('hides and restores back and continue', () => {
    const current = step({ back: { label: 'Previous' } });
    setBackVisible(current, false);
    expect(current.back).toBe(false);
    setBackVisible(current, true);
    expect(current.back).toBeUndefined();
    setNextVisible(current, false);
    expect(current.next).toBe(false);
  });

  it('adds, renames and removes the cancel button', () => {
    const form = definition();
    setCancel(form, 'Cancel');
    setCancel(form, 'Close');
    expect(form.cancel).toEqual({ label: 'Close' });
    setCancel(form, null);
    expect(form.cancel).toBeUndefined();
  });
});
