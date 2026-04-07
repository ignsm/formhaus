<script setup lang="ts">
import type { FormAction } from '@formhaus/core';

const props = defineProps<{
  submitAction?: FormAction;
  backAction?: FormAction | false;
  cancelAction?: FormAction;
  isFirstStep: boolean;
  isLastStep: boolean;
  isMultiStep: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'next'): void;
  (e: 'prev'): void;
  (e: 'cancel'): void;
  (e: 'action', name: string): void;
}>();

function getButtonClass(variant?: string): string {
  switch (variant) {
    case 'secondary':
      return 'fh-form-actions__button--secondary';
    case 'text':
      return 'fh-form-actions__button--text';
    default:
      return 'fh-form-actions__button--primary';
  }
}

function onPrimaryClick() {
  if (props.isMultiStep && !props.isLastStep) {
    emit('next');
  } else {
    emit('submit');
  }
}

function getPrimaryLabel(): string {
  if (props.isMultiStep && !props.isLastStep) {
    return 'Continue';
  }
  return props.submitAction?.label ?? 'Submit';
}
</script>

<template>
  <div class="fh-form-actions">
    <div class="fh-form-actions__secondary">
      <button
        v-if="props.isMultiStep && !props.isFirstStep && props.backAction !== false"
        type="button"
        :class="['fh-form-actions__button', typeof props.backAction === 'object' ? getButtonClass(props.backAction?.variant) : 'fh-form-actions__button--text']"
        :disabled="props.loading"
        @click="emit('prev')"
      >
        {{ (typeof props.backAction === 'object' ? props.backAction?.label : undefined) ?? 'Back' }}
      </button>
      <button
        v-if="props.cancelAction"
        type="button"
        :class="['fh-form-actions__button', getButtonClass(props.cancelAction.variant)]"
        :disabled="props.loading"
        @click="emit('cancel')"
      >
        {{ props.cancelAction.label }}
      </button>
    </div>
    <button
      type="button"
      class="fh-form-actions__button fh-form-actions__button--primary"
      :disabled="props.loading"
      @click="onPrimaryClick"
    >
      {{ getPrimaryLabel() }}
    </button>
  </div>
</template>

<style scoped>
.fh-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fh-form-actions__secondary {
  display: flex;
  gap: 12px;
}

.fh-form-actions__button {
  cursor: pointer;
}

.fh-form-actions__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
