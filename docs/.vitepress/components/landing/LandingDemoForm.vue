<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { FormRenderer } from '@formhaus/vue';
import type { FormDefinition } from '@formhaus/core';
import LucideIcon from './LucideIcon.vue';
import './demo-form.css';
import './demo-actions.css';

const props = defineProps<{ definition: FormDefinition; choiceKey: string }>();
const emit = defineEmits<{ step: [id: string]; choice: [value: string | undefined]; done: [value: boolean] }>();

const run = ref(0);
const payload = ref<Record<string, unknown>>();
const result = ref<HTMLElement>();

function onField(key: string, value: unknown) {
  if (key === props.choiceKey) emit('choice', typeof value === 'string' ? value : undefined);
}

async function onSubmit(values: Record<string, unknown>) {
  payload.value = values;
  emit('done', true);
  await nextTick();
  result.value?.focus();
}

function restart() {
  payload.value = undefined;
  run.value += 1;
  emit('done', false);
  emit('choice', undefined);
  emit('step', props.definition.steps?.[0]?.id ?? '');
}
</script>

<template>
  <div class="demo-form">
    <div v-if="payload" ref="result" class="demo-form__result" tabindex="-1">
      <span class="demo-form__badge"><LucideIcon name="check" /></span>
      <p class="demo-form__heading">Submitted</p>
      <p class="demo-form__hint">Only the answered branch is sent.</p>
      <pre class="demo-form__payload"><code>{{ JSON.stringify(payload, null, 2) }}</code></pre>
      <button type="button" class="demo-form__restart" @click="restart">Start over</button>
    </div>
    <FormRenderer
      v-else
      :key="run"
      :definition="props.definition"
      @step-change="(id) => emit('step', id)"
      @field-change="onField"
      @submit="onSubmit"
    />
  </div>
</template>
