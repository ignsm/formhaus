import { isVisible, type FormEngine, type FormField, type FormStep } from '@formhaus/core';
import { createEngine } from './engine';
import { inspectDefinition, type ValidationReport } from './validate';

export type SimulationAction = 'next' | 'back' | 'skip';

export interface SimulationInput {
  definition: unknown;
  answers?: Record<string, unknown>;
  actions?: SimulationAction[];
}

export interface TraceEntry {
  action: SimulationAction;
  from: string | null;
  to: string | null;
  moved: boolean;
  errors?: Record<string, string>;
}

export interface StepReport {
  id: string;
  title: string;
  skipped: boolean;
  visibleFields: string[];
}

export interface SimulationResult {
  ok: boolean;
  validation: ValidationReport;
  multiStep?: boolean;
  path?: StepReport[];
  currentStep?: { id: string; title: string; index: number } | null;
  isLastStep?: boolean;
  trace?: TraceEntry[];
  errors?: Record<string, string>;
  wouldSubmit?: boolean;
  submitValues?: Record<string, unknown>;
}

function pathValues(engine: FormEngine): Record<string, unknown> {
  const keys = new Set(engine.visibleSteps.flatMap((step) => step.fields.map(({ key }) => key)));
  return Object.fromEntries(Object.entries(engine.values).filter(([key]) => keys.has(key)));
}

function visibleKeys(fields: FormField[], values: Record<string, unknown>): string[] {
  return fields.filter((field) => isVisible(field, values)).map(({ key }) => key);
}

function stepReport(engine: FormEngine, step: FormStep, values: Record<string, unknown>): StepReport {
  return { id: step.id, title: step.title, skipped: engine.isStepSkipped(step.id), visibleFields: visibleKeys(step.fields, values) };
}

function perform(engine: FormEngine, action: SimulationAction): TraceEntry {
  const from = engine.currentStep?.id ?? null;
  const index = engine.currentStepIndex;
  if (action === 'next') engine.nextStep();
  else if (action === 'skip') engine.skipStep();
  else engine.prevStep();
  const to = engine.currentStep?.id ?? null;
  const moved = engine.currentStepIndex !== index || to !== from;
  const errors = !moved && action === 'next' && Object.keys(engine.errors).length > 0 ? { ...engine.errors } : undefined;
  return { action, from, to, moved, ...(errors && { errors }) };
}

function run(engine: FormEngine, actions: SimulationAction[] | undefined): TraceEntry[] {
  if (actions) return actions.map((action) => perform(engine, action));
  const trace: TraceEntry[] = [];
  while (engine.isMultiStep && !engine.isLastStep) {
    const entry = perform(engine, 'next');
    trace.push(entry);
    if (!entry.moved) break;
  }
  return trace;
}

export async function simulatePathTool(input: SimulationInput): Promise<SimulationResult> {
  const { report, definition } = await inspectDefinition(input.definition);
  if (!definition) return { ok: false, validation: report };
  const created = createEngine(definition, input.answers);
  if (!created.ok) return { ok: false, validation: { ...report, valid: false, errors: created.errors } };
  const { engine } = created;
  const trace = run(engine, input.actions);
  const values = engine.isMultiStep ? pathValues(engine) : engine.values;
  const path = engine.isMultiStep
    ? engine.visibleSteps.map((step) => stepReport(engine, step, values))
    : [{ id: definition.id, title: definition.title, skipped: false, visibleFields: visibleKeys(definition.fields ?? [], values) }];
  const step = engine.currentStep;
  const errors = engine.validate();
  const atEnd = !engine.isMultiStep || engine.isLastStep;
  return {
    ok: true,
    validation: report,
    multiStep: engine.isMultiStep,
    path,
    currentStep: step ? { id: step.id, title: step.title, index: engine.currentStepIndex } : null,
    isLastStep: atEnd,
    trace,
    errors,
    wouldSubmit: atEnd && Object.keys(errors).length === 0,
    submitValues: engine.getSubmitValues(),
  };
}
