<script setup lang="ts">
import { ref, computed } from 'vue';
import { Sandpack } from 'sandpack-vue3';
import PlaygroundDefinitionPanel from './PlaygroundDefinitionPanel.vue';
import { fixtures, fixtureNames } from './fixtures';
import * as reactMui from './loaders/react-mui';
import * as vueVuetify from './loaders/vue-vuetify';
import * as vanillaSvelte from './loaders/vanilla-svelte';

const props = defineProps<{ framework: 'react' | 'vue' | 'svelte' }>();

const loaders = {
  react: reactMui,
  vue: vueVuetify,
  svelte: vanillaSvelte,
} as const;

const selected = ref(fixtureNames[0]);

const loader = computed(() => loaders[props.framework]);

const definitionJson = computed(() =>
  JSON.stringify(fixtures[selected.value], null, 2),
);

const files = computed(() => loader.value.buildFiles(definitionJson.value));
</script>

<template>
  <div>
    <div class="fh-playground-tabs">
      <button
        v-for="name in fixtureNames"
        :key="name"
        :class="['fh-playground-tab', { active: selected === name }]"
        @click="selected = name"
      >{{ name }}</button>
    </div>
    <Sandpack
      :key="framework + '-' + selected"
      :template="loader.template"
      :files="files"
      :options="{
        showConsole: true,
        editorHeight: loader.editorHeight,
        activeFile: loader.activeFile,
        visibleFiles: loader.visibleFiles,
      }"
      :custom-setup="{ dependencies: loader.deps }"
    />
    <PlaygroundDefinitionPanel :definition="fixtures[selected]" />
  </div>
</template>

<style scoped>
.fh-playground-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.fh-playground-tab {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.fh-playground-tab.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
</style>
