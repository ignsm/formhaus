<script setup lang="ts">
import { ref, useId } from 'vue';
import BuilderMenu from './BuilderMenu.vue';
import LucideIcon from './LucideIcon.vue';

const emit = defineEmits<{ insert: []; move: [delta: number]; remove: [] }>();

const id = useId();
const open = ref(false);
const items = [
  { id: 'up', label: 'Move up' },
  { id: 'down', label: 'Move down' },
  { id: 'remove', label: 'Delete' },
];

function pick(item: string) {
  open.value = false;
  if (item === 'remove') emit('remove');
  else emit('move', item === 'up' ? -1 : 1);
}
</script>

<template>
  <span class="nb-gutter">
    <button type="button" class="nb-tool" aria-label="Add a question below" @click="emit('insert')">
      <LucideIcon name="plus" />
    </button>
    <span class="nb-anchor">
      <button type="button" class="nb-tool" aria-label="Line actions" :aria-expanded="open" @click="open = true">
        <span aria-hidden="true">⋮⋮</span>
      </button>
      <BuilderMenu v-if="open" :id="`${id}-actions`" :items="items" label="Line actions" @pick="pick" @close="open = false" />
    </span>
  </span>
</template>
