<script setup lang="ts">
import AutoInput from './AutoInput.vue';
import type { BuilderPage } from './builder-model';

defineProps<{ page: BuilderPage }>();
const emit = defineEmits<{ after: []; remove: []; edit: [] }>();

function onKey(event: KeyboardEvent, empty: boolean) {
  if (event.key === 'Enter') {
    event.preventDefault();
    emit('after');
  } else if (event.key === 'Backspace' && empty) {
    event.preventDefault();
    emit('remove');
  }
}
</script>

<template>
  <div class="nb-block nb-page" :data-uid="page.uid">
    <div class="nb-line">
      <AutoInput
        v-model="page.title"
        placeholder="Page name"
        label="Page name"
        @keydown="onKey($event, !page.title)"
        @input="emit('edit')"
      />
    </div>
  </div>
</template>
