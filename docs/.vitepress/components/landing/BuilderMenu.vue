<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { MenuItem } from './builder-model';

const props = defineProps<{ id: string; items: MenuItem[]; current?: string; label: string }>();
const emit = defineEmits<{ pick: [id: string]; close: [] }>();

const list = ref<HTMLElement>();
const active = ref(Math.max(0, props.items.findIndex((item) => item.id === props.current)));

onMounted(() => list.value?.focus());

function onKey(event: KeyboardEvent) {
  const last = props.items.length - 1;
  if (event.key === 'ArrowDown') active.value = active.value === last ? 0 : active.value + 1;
  else if (event.key === 'ArrowUp') active.value = active.value === 0 ? last : active.value - 1;
  else if (event.key === 'Home') active.value = 0;
  else if (event.key === 'End') active.value = last;
  else if (event.key === 'Enter' || event.key === ' ') emit('pick', props.items[active.value].id);
  else if (event.key === 'Escape' || event.key === 'Tab') emit('close');
  else return;
  if (event.key !== 'Tab') event.preventDefault();
}
</script>

<template>
  <ul
    :id="`${props.id}-menu`"
    ref="list"
    class="menu"
    role="listbox"
    tabindex="-1"
    :aria-label="props.label"
    :aria-activedescendant="`${props.id}-menu-${active}`"
    @keydown="onKey"
    @blur="emit('close')"
  >
    <li
      v-for="(item, index) in props.items"
      :id="`${props.id}-menu-${index}`"
      :key="item.id"
      role="option"
      class="menu__item"
      :aria-selected="item.id === props.current"
      :data-active="index === active"
      @mousedown.prevent
      @mouseenter="active = index"
      @click="emit('pick', item.id)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<style scoped>
.vp-doc .menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  width: 200px;
  margin: 0;
  padding: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  list-style: none;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  outline: none;
}

.vp-doc .menu__item {
  margin: 0;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.menu__item[data-active='true'] {
  background: var(--vp-c-default-soft);
}

.menu__item[aria-selected='true'] {
  color: var(--vp-c-brand-1);
}
</style>
