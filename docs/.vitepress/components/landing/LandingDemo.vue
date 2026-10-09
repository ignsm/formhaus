<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, shallowRef, watch } from 'vue';
import { validateDefinition, type FormDefinition } from '@formhaus/core';
import seed from '../../../recipes/definitions/onboarding.json';
import LandingBuilder from './LandingBuilder.vue';
import LandingFlow from './LandingFlow.vue';
import LandingJson from './LandingJson.vue';
import LucideIcon from './LucideIcon.vue';
import { fromDefinition, toDefinition } from './builder-model';
import { buildGraph, nextStep } from './flow-graph';
import { flowState } from './flow-state';
import { formatJson, stepRanges } from './json-format';

const LandingDemoForm = defineAsyncComponent(() => import('./LandingDemoForm.vue'));

const tabs = [
  { id: 'write', label: 'Write' },
  { id: 'json', label: 'JSON' },
  { id: 'preview', label: 'Preview' },
] as const;
type Tab = (typeof tabs)[number]['id'];

const model = reactive(fromDefinition(seed as FormDefinition));
const definition = computed(() => toDefinition(model));
const source = computed(() => formatJson(definition.value));
const issues = computed(() => validateDefinition(definition.value).length);
const live = shallowRef(definition.value);
const graph = computed(() => buildGraph(live.value));
const tab = ref<Tab>('write');
const group = ref(0);
const run = ref(0);
const first = () => live.value.steps?.[0]?.id ?? '';
const history = ref<string[]>([first()]);
const values = ref<Record<string, unknown>>({});
const done = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;
watch(definition, (next) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    live.value = next;
    history.value = [first()];
    done.value = false;
  }, 120);
});

const state = computed(() => flowState({ definition: live.value, graph: graph.value, history: history.value, values: values.value, done: done.value }));
const range = computed(() => {
  const id = definition.value.steps?.[group.value]?.id;
  return id ? stepRanges(source.value, [id])[id] : undefined;
});
const progress = computed(() => {
  const path: string[] = [];
  for (let id: string | undefined = first(); id && !path.includes(id); id = nextStep(live.value, id, values.value)) path.push(id);
  const at = path.indexOf(history.value[history.value.length - 1]);
  return path.length > 1 ? `Step ${Math.max(1, at + 1)} of ${path.length}` : 'One page';
});

function onStep(id: string) {
  const index = history.value.indexOf(id);
  history.value = index >= 0 ? history.value.slice(0, index + 1) : [...history.value, id];
}

function restart() {
  values.value = {};
  history.value = [first()];
  done.value = false;
  run.value += 1;
}

function onTabKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  const visible = tabs.filter((item) => getComputedStyle(document.getElementById(`sandbox-tab-${item.id}`)!).display !== 'none');
  const index = visible.findIndex((item) => item.id === tab.value);
  const next = visible[(index + (event.key === 'ArrowRight' ? 1 : -1) + visible.length) % visible.length];
  tab.value = next.id;
  document.getElementById(`sandbox-tab-${next.id}`)?.focus();
}
</script>

<template>
  <section class="lp-section" aria-labelledby="demo-title">
    <p class="lp-eyebrow">Live demo</p>
    <h2 id="demo-title" class="lp-title">Write it like a doc</h2>
    <p class="lp-lead">Type the questions. The form, the flow and the JSON follow.</p>
    <div class="sandbox" :data-tab="tab">
      <div class="sandbox__bar sandbox__bar--left">
        <span class="sandbox__dots" aria-hidden="true"><i /><i /><i /></span>
        <div class="sandbox__tabs" role="tablist" aria-label="Demo view" @keydown="onTabKey">
          <button
            v-for="item in tabs"
            :id="`sandbox-tab-${item.id}`"
            :key="item.id"
            type="button"
            role="tab"
            class="sandbox__tab"
            :data-tab="item.id"
            :aria-selected="tab === item.id"
            :aria-controls="`sandbox-${item.id}`"
            :tabindex="tab === item.id ? 0 : -1"
            @click="tab = item.id"
          >
            {{ item.label }}
          </button>
        </div>
        <span v-if="issues" class="sandbox__issues" role="status">{{ issues }} {{ issues === 1 ? 'issue' : 'issues' }}</span>
      </div>
      <div class="sandbox__bar sandbox__bar--right">
        <span class="sandbox__label">Flow</span>
        <button type="button" class="sandbox__restart" @click="restart">Restart <LucideIcon name="restart" /></button>
      </div>
      <div id="sandbox-write" class="sandbox__pane sandbox__pane--write" role="tabpanel" aria-labelledby="sandbox-tab-write">
        <LandingBuilder :form="model" @page="(index) => (group = index)" />
      </div>
      <div id="sandbox-json" class="sandbox__pane sandbox__pane--json" role="tabpanel" aria-labelledby="sandbox-tab-json">
        <LandingJson :source="source" :range="range" />
      </div>
      <div class="sandbox__graph"><LandingFlow :graph="graph" :state="state" /></div>
      <div id="sandbox-preview" class="sandbox__pane sandbox__pane--preview" role="tabpanel" aria-labelledby="sandbox-tab-preview">
        <div class="sandbox__preview">
          <ClientOnly>
            <LandingDemoForm
              :key="`${run}-${formatJson(live)}`"
              :definition="live"
              :initial="values"
              @step="onStep"
              @values="(next) => (values = next)"
              @done="(value) => (done = value)"
            />
          </ClientOnly>
        </div>
        <div class="sandbox__footer"><span>{{ progress }}</span><code>@formhaus/vue</code></div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./sandbox.css"></style>
