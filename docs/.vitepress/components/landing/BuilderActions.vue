<script setup lang="ts">
import AutoInput from './AutoInput.vue';
import { DEFAULT_BACK, DEFAULT_NEXT, type BuilderForm, type BuilderPage } from './builder-model';

defineProps<{ form: BuilderForm; page?: BuilderPage; first: boolean; last: boolean }>();
const emit = defineEmits<{ edit: [] }>();
</script>

<template>
  <div class="nb-actions" aria-label="Page buttons">
    <span v-if="page && !first" class="nb-btn" data-tip="Edit label">
      <AutoInput v-model="page.backLabel" :placeholder="DEFAULT_BACK" label="Back button label" @input="emit('edit')" />
    </span>
    <span v-if="page && !last" class="nb-btn nb-btn--primary" data-tip="Edit label">
      <AutoInput v-model="page.nextLabel" :placeholder="DEFAULT_NEXT" label="Continue button label" @input="emit('edit')" />
    </span>
    <span v-else class="nb-btn nb-btn--primary" data-tip="Edit label">
      <AutoInput v-model="form.submit" placeholder="Submit" label="Submit button label" select-on-focus @input="emit('edit')" />
    </span>
  </div>
</template>
