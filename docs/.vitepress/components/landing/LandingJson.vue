<script setup lang="ts">
import { computed, ref } from 'vue';
import LucideIcon from './LucideIcon.vue';
import { tokenize } from './json-format';

const props = defineProps<{ source: string; range?: [number, number] }>();
const lines = computed(() => tokenize(props.source));
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.source);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="json">
    <button type="button" class="json__copy" aria-label="Copy JSON" @click="copy">
      <LucideIcon :name="copied ? 'check' : 'copy'" /> {{ copied ? 'Copied' : 'Copy' }}
    </button>
    <pre class="json__pre" tabindex="0" aria-label="Generated form definition"><code><span
      v-for="(line, index) in lines"
      :key="index"
      class="json__line"
      :data-hl="!!range && index >= range[0] && index <= range[1]"
    ><span v-for="(token, position) in line" :key="position" :class="`json__${token.kind}`">{{ token.text }}</span></span></code></pre>
  </div>
</template>

<style scoped>
.json {
  position: relative;
  height: 100%;
  background: var(--vp-code-block-bg);
}

.json__copy {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
}

.json__copy:hover {
  color: var(--vp-c-text-1);
}

.json__pre {
  height: 100%;
  margin: 0;
  padding: 56px 24px 24px;
  overflow: auto;
  overscroll-behavior: contain;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--vp-c-text-2);
}

.json__pre:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.json__pre code {
  padding: 0;
  font-size: inherit;
  color: inherit;
  background: none;
}

.json__line {
  display: block;
  margin: 0 -24px;
  padding: 0 24px;
  box-shadow: inset 2px 0 transparent;
}

.json__line[data-hl='true'] {
  box-shadow: inset 2px 0 var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.json__key {
  color: var(--vp-c-brand-1);
}

.json__string {
  color: var(--vp-c-green-1);
}

.json__literal {
  color: var(--vp-c-yellow-1);
}
</style>
