import type { FormDefinition, FormField, FormStep, StepRoute } from '@formhaus/core';

export const QUESTION_TYPES = [
  { type: 'text', label: 'text' },
  { type: 'email', label: 'email' },
  { type: 'radio', label: 'choice' },
  { type: 'multiselect', label: 'checkboxes' },
  { type: 'textarea', label: 'long text' },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]['type'];
export interface MenuItem { id: string; label: string }
export const TYPE_ITEMS: MenuItem[] = QUESTION_TYPES.map((item) => ({ id: item.type, label: item.label }));
export const SLASH_ITEMS: MenuItem[] = [...TYPE_ITEMS, { id: 'page', label: 'page' }];

export interface BuilderOption { uid: string; label: string; jump: string | null }
export interface BuilderQuestion {
  kind: 'question';
  uid: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options: BuilderOption[];
  extra: Partial<FormField>;
}
export interface BuilderPage { kind: 'page'; uid: string; title: string }
export type BuilderBlock = BuilderQuestion | BuilderPage;
export interface BuilderForm { id: string; title: string; submit: string; blocks: BuilderBlock[] }

let counter = 0;
export const uid = () => `b${(counter += 1)}`;
export const hasOptions = (type: QuestionType) => type === 'radio' || type === 'multiselect';
export const newPage = (title = ''): BuilderPage => ({ kind: 'page', uid: uid(), title });
export const newOption = (label = ''): BuilderOption => ({ uid: uid(), label, jump: null });

export function newQuestion(type: QuestionType = 'text'): BuilderQuestion {
  const question: BuilderQuestion = { kind: 'question', uid: uid(), label: '', type, required: false, options: [], extra: {} };
  setType(question, type);
  return question;
}

export function setType(question: BuilderQuestion, type: QuestionType): void {
  question.type = type;
  if (hasOptions(type) && !question.options.length) question.options.push(newOption('Option 1'));
}

function words(label: string): string[] {
  return label.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
}

function unique(base: string, taken: Set<string>, join = ''): string {
  let value = base;
  for (let index = 2; taken.has(value); index++) value = `${base}${join}${index}`;
  taken.add(value);
  return value;
}

function keyFromLabel(label: string, taken: Set<string>): string {
  const base = words(label).map((word, index) => (index ? word[0].toUpperCase() + word.slice(1) : word)).join('') || 'question';
  return unique(/^\d/.test(base) ? `q${base}` : base, taken);
}

const slug = (label: string, taken: Set<string>, fallback: string) => unique(words(label).join('-') || fallback, taken, '-');
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function laterPages(form: BuilderForm, index: number): BuilderPage[] {
  return form.blocks.slice(index + 1).filter((block): block is BuilderPage => block.kind === 'page');
}

export function pageOf(form: BuilderForm, index: number): BuilderPage | undefined {
  return form.blocks.slice(0, index + 1).reverse().find((block): block is BuilderPage => block.kind === 'page');
}

function question(field: FormField, routes: StepRoute[], titles: Map<string, string>): BuilderQuestion {
  const { key, type, label, options, validation, ...extra } = field;
  const { required, ...rules } = validation ?? {};
  const routed = routes.some((item) => item.show?.some((condition) => condition.field === key));
  const fallback = routes.find((item) => !item.show?.length && !item.showAny?.length)?.to;
  const jump = (value: string) => {
    const route = routes.find((item) => item.show?.length === 1 && item.show[0].field === key && item.show[0].eq === value);
    const to = route?.to ?? (routed ? fallback : undefined);
    return to ? titles.get(to) ?? null : null;
  };
  return {
    kind: 'question',
    uid: uid(),
    label: label ?? '',
    type: QUESTION_TYPES.find((item) => item.type === type)?.type ?? 'text',
    required: !!required,
    options: (options ?? []).map((option) => ({ uid: uid(), label: option.label, jump: jump(option.value) })),
    extra: { ...extra, ...(Object.keys(rules).length ? { validation: rules } : {}) },
  };
}

export function fromDefinition(definition: FormDefinition): BuilderForm {
  const base = { id: definition.id, title: definition.title ?? '', submit: definition.submit?.label ?? 'Submit' };
  if (!definition.steps) return { ...base, blocks: (definition.fields ?? []).map((field) => question(field, [], new Map())) };
  const titles = new Map(definition.steps.map((step) => [step.id, step.title ?? step.id]));
  const blocks = definition.steps.flatMap((step): BuilderBlock[] => [
    newPage(titles.get(step.id)),
    ...step.fields.map((field) => question(field, step.routes ?? [], titles)),
  ]);
  return { ...base, blocks };
}

function field(item: BuilderQuestion, keys: Set<string>, values: Map<string, string>): FormField {
  const { validation, ...extra } = item.extra;
  const rules = { ...(item.required ? { required: true } : {}), ...validation };
  const result: FormField = { key: keyFromLabel(item.label, keys), type: item.type, label: item.label || 'Untitled question', ...extra };
  if (Object.keys(rules).length) result.validation = rules;
  if (hasOptions(item.type)) {
    const taken = new Set<string>();
    result.options = item.options.map((option) => {
      const value = slug(option.label, taken, 'option');
      values.set(option.uid, value);
      return { value, label: option.label || value };
    });
  }
  return result;
}

interface Group { page?: BuilderPage; questions: BuilderQuestion[] }

function groups(form: BuilderForm): Group[] {
  const result: Group[] = [];
  for (const block of form.blocks) {
    if (block.kind === 'page') result.push({ page: block, questions: [] });
    else (result[result.length - 1] ?? (result[0] = { questions: [] })).questions.push(block);
  }
  return result;
}

export function toDefinition(form: BuilderForm): FormDefinition {
  const keys = new Set<string>();
  const values = new Map<string, string>();
  const parts = groups(form);
  const head = { $schema: 'https://formhaus.dev/schema/form-definition.json', id: form.id, title: form.title || 'Untitled form', submit: { label: form.submit || 'Submit' } };
  if (parts.length < 2) return { ...head, fields: (parts[0]?.questions ?? []).map((item) => field(item, keys, values)) } as FormDefinition;
  const taken = new Set<string>();
  const ids = parts.map((part, index) => slug(part.page?.title ?? '', taken, `page-${index + 1}`));
  const fields = parts.map((part) => part.questions.map((item) => field(item, keys, values)));
  const routes: StepRoute[][] = parts.map(() => []);
  const exits = new Map<number, number>();
  parts.forEach((part, index) => {
    const targets: number[] = [];
    let routing = 0;
    let covered = false;
    part.questions.forEach((item, position) => {
      if (item.type !== 'radio') return;
      const found = item.options.map((option) => parts.findIndex((other, at) => at > index && !!option.jump && same(other.page?.title ?? '', option.jump)));
      found.forEach((target, at) => {
        if (target < 0) return;
        targets.push(target);
        routes[index].push({ to: ids[target], show: [{ field: fields[index][position].key, eq: values.get(item.options[at].uid)! }] });
      });
      if (found.some((target) => target >= 0)) routing += 1;
      covered = found.length > 0 && found.every((target) => target >= 0);
    });
    if (!targets.length) return;
    if (routing === 1 && covered) delete routes[index][routes[index].length - 1].show;
    else if (index + 1 < parts.length) routes[index].push({ to: ids[index + 1] });
    const after = Math.max(...targets) + 1;
    for (const target of targets) if (after < parts.length && target + 1 < after) exits.set(target, Math.max(exits.get(target) ?? 0, after));
  });
  for (const [index, after] of exits) if (!routes[index].length) routes[index].push({ to: ids[after] });
  const steps = parts.map((part, index): FormStep => {
    const step: FormStep = { id: ids[index], title: part.page?.title || `Page ${index + 1}`, fields: fields[index] };
    if (routes[index].length) step.routes = routes[index];
    return step;
  });
  return { ...head, steps } as FormDefinition;
}

export function jumpKnown(form: BuilderForm, index: number, jump: string): boolean {
  return laterPages(form, index).some((page) => same(page.title, jump));
}
