import type { FormDefinition } from '@formhaus/core';
import { describe, expect, it } from 'vitest';
import { buildGraph } from '../flow/graph';

const quiz: FormDefinition = {
  id: 'quiz', title: 'Quiz', submit: { label: 'Done' },
  steps: [
    { id: 'goal', title: 'Goal', fields: [{ key: 'goal', type: 'radio', label: 'What do you need?', options: [{ value: 'leads', label: 'Collect leads' }, { value: 'survey', label: 'Run surveys' }] }],
      routes: [{ to: 'leads', show: [{ field: 'goal', eq: 'leads' }] }, { to: 'survey', show: [{ field: 'goal', eq: 'survey' }] }] },
    { id: 'leads', title: 'Leads', fields: [{ key: 'volume', type: 'number', label: 'Leads a month' }], routes: [{ to: 'contact' }] },
    { id: 'survey', title: 'Survey', fields: [{ key: 'size', type: 'number', label: 'Respondents' }], routes: [{ to: null, show: [{ field: 'size', notEmpty: true }] }] },
    { id: 'contact', title: 'Contact', fields: [{ key: 'email', type: 'email', label: 'Email' }] },
  ],
};

describe('buildGraph', () => {
  it('turns routes into labelled edges with fallthrough and end edges', () => {
    const graph = buildGraph(quiz);
    expect(graph.branching).toBe(true);
    expect(graph.edges).toEqual([
      { from: 'goal', to: 'leads', label: 'What do you need? is Collect leads or otherwise' },
      { from: 'goal', to: 'survey', label: 'What do you need? is Run surveys' },
      { from: 'leads', to: 'contact', label: '' },
      { from: 'survey', to: null, label: 'Respondents is filled' },
      { from: 'survey', to: 'contact', label: 'Otherwise' },
      { from: 'contact', to: null, label: '' },
    ]);
  });

  it('places each step one column after its deepest predecessor', () => {
    expect([...buildGraph(quiz).depth]).toEqual([['goal', 0], ['leads', 1], ['survey', 1], ['contact', 2]]);
  });

  it('keeps linear forms in a single chain without branching', () => {
    const linear = buildGraph({ id: 'l', title: 'L', submit: { label: 'Go' }, steps: [{ id: 'a', title: 'A', fields: [] }, { id: 'b', title: 'B', fields: [] }] });
    expect(linear.branching).toBe(false);
    expect([...linear.depth]).toEqual([['a', 0], ['b', 1]]);
  });
});
