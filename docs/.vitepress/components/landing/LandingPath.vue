<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ current: string; choice?: string; done: boolean }>();

const first = { id: 'use', title: 'Workspace' };
const last = { id: 'finish', title: 'Invite' };
const branches = [
  { id: 'team', title: 'Team', when: 'team' },
  { id: 'solo', title: 'Project', when: 'solo' },
];

const chosen = computed(() => branches.find((branch) => branch.when === props.choice)?.id);

function state(id: string) {
  const branch = branches.some((item) => item.id === id);
  if (branch && chosen.value && id !== chosen.value) return 'skipped';
  if (props.done) return 'visited';
  if (id === props.current) return 'current';
  if (id === first.id) return 'visited';
  if (branch && props.current === last.id) return 'visited';
  return 'idle';
}

const current = (id: string) => (state(id) === 'current' ? 'step' : undefined);
</script>

<template>
  <ol class="path" aria-label="Route">
    <li>
      <span class="path__step" :data-state="state(first.id)" :aria-current="current(first.id)">{{ first.title }}</span>
    </li>
    <li class="path__fork">
      <ol class="path__branches" aria-label="Branches">
        <li v-for="branch in branches" :key="branch.id">
          <span class="path__step" :data-state="state(branch.id)" :aria-current="current(branch.id)">
            {{ branch.title }}<span v-if="state(branch.id) === 'skipped'" class="path__note"> (skipped)</span>
          </span>
        </li>
      </ol>
    </li>
    <li>
      <span class="path__step" :data-state="state(last.id)" :aria-current="current(last.id)">{{ last.title }}</span>
    </li>
  </ol>
</template>

<style scoped>
.path,
.path__branches {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.path {
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  line-height: 1.2;
}

.path__branches {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

.path li {
  display: flex;
  align-items: center;
  margin: 0;
}

.path > li + li::before {
  content: '';
  width: 14px;
  height: 1px;
  margin-right: 8px;
  background: var(--vp-c-divider);
}

.path__step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  transition: opacity 0.25s, border-color 0.25s, color 0.25s, background-color 0.25s;
}

.path__step::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  transition: background-color 0.25s;
}

.path__step[data-state='current'] {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.path__step[data-state='current']::before,
.path__step[data-state='visited']::before {
  background: var(--vp-c-brand-2);
}

.path__step[data-state='visited'] {
  color: var(--vp-c-text-1);
}

.path__step[data-state='skipped'] {
  opacity: 0.4;
}

@media (max-width: 479px) {
  .path {
    gap: 4px;
    font-size: 12px;
  }

  .path > li + li::before {
    width: 6px;
    margin-right: 4px;
  }

  .path__step {
    gap: 4px;
    padding: 4px 8px;
  }
}

.path__note {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
