<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { FormRenderer } from '@formhaus/vue';
import type { FormDefinition } from '@formhaus/core';
import LucideIcon from './LucideIcon.vue';
import './demo-form.css';
import './demo-actions.css';

const props = defineProps<{ definition: FormDefinition; initial?: Record<string, unknown>; hint?: string }>();
const emit = defineEmits<{
  step: [id: string];
  values: [values: Record<string, unknown>];
  done: [value: boolean];
}>();

const payload = ref<Record<string, unknown>>();
const result = ref<HTMLElement>();

async function onSubmit(values: Record<string, unknown>) {
  payload.value = values;
  emit('done', true);
  await nextTick();
  result.value?.focus();
}
</script>

<template>
  <div class="demo-form">
    <div v-if="payload" ref="result" class="demo-form__result" tabindex="-1">
      <span class="demo-form__badge"><LucideIcon name="check" /></span>
      <p class="demo-form__heading">Submitted</p>
      <p v-if="hint" class="demo-form__hint">{{ hint }}</p>
      <pre class="demo-form__payload"><code>{{ JSON.stringify(payload, null, 2) }}</code></pre>
    </div>
    <FormRenderer
      v-else
      :definition="props.definition"
      :initial-values="props.initial"
      @step-change="(id) => emit('step', id)"
      @field-change="(_key, _value, values) => emit('values', { ...values })"
      @submit="onSubmit"
    />
  </div>
</template>
