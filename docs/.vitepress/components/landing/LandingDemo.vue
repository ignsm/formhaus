<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import type { FormDefinition } from '@formhaus/core';
import definition from '../../../recipes/definitions/home-onboarding.json';
import LandingPath from './LandingPath.vue';

const LandingDemoForm = defineAsyncComponent(() => import('./LandingDemoForm.vue'));

const current = ref('use');
const choice = ref<string>();
const done = ref(false);
const expanded = ref(false);
</script>

<template>
  <section class="lp-section" aria-labelledby="demo-title">
    <p class="lp-eyebrow">Live demo</p>
    <h2 id="demo-title" class="lp-title">One file, one live form</h2>
    <p class="lp-lead">Change the answer. Watch the route change.</p>
    <div class="demo">
      <figure class="demo__code" :class="{ 'demo__code--open': expanded }">
        <figcaption class="demo__caption">home-onboarding.json</figcaption>
        <div id="demo-json" class="demo__json"><slot /></div>
        <button type="button" class="demo__more" aria-controls="demo-json" :aria-expanded="expanded" @click="expanded = !expanded">
          {{ expanded ? 'Show less' : 'Show the whole file' }}
        </button>
      </figure>
      <div class="demo__live">
        <div class="demo__head">
          <span class="demo__caption">Rendered with <code>@formhaus/vue</code></span>
          <LandingPath :current="current" :choice="choice" :done="done" />
        </div>
        <div class="demo__form">
          <ClientOnly>
            <LandingDemoForm
              :definition="definition as FormDefinition"
              choice-key="use"
              @step="(id) => (current = id)"
              @choice="(value) => (choice = value)"
              @done="(value) => (done = value)"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo {
  display: grid;
  gap: 24px;
  margin-top: 40px;
}

.demo__code {
  min-width: 0;
  margin: 0;
}

.demo__code :deep(div[class*='language-']) {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
}

.demo__code :deep(div[class*='language-'] pre) {
  padding: 16px 0;
  overflow: visible;
}

.demo__code :deep(div[class*='language-'] code) {
  display: block;
  width: auto;
  padding: 0 20px;
  font-size: 12.5px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.demo__code :deep(.lang) {
  display: none;
}

.demo .demo__caption {
  display: block;
  margin: 0 0 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 20px;
  color: var(--vp-c-text-2);
}

.demo__caption code {
  font-size: inherit;
}

.demo__live {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 16px 48px -12px rgba(91, 63, 176, 0.18);
}

.demo__head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.demo__head .demo__caption {
  margin-bottom: 10px;
}

.demo__form {
  min-height: 380px;
  padding: 28px 24px;
}

.demo__json {
  position: relative;
}

.demo__more {
  display: none;
}

@media (max-width: 959px) {
  .demo__live {
    order: -1;
  }

  .demo__form {
    min-height: 0;
  }

  .demo__code:not(.demo__code--open) .demo__json {
    max-height: 340px;
    overflow: hidden;
  }

  .demo__code:not(.demo__code--open) .demo__json::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 120px;
    border-radius: 0 0 14px 14px;
    background: linear-gradient(transparent, var(--vp-c-bg));
    pointer-events: none;
  }

  .demo__more {
    display: block;
    margin: 12px auto 0;
    padding: 8px 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    background: var(--vp-c-bg-soft);
  }

  .demo__more:focus-visible {
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 2px;
  }
}

@media (min-width: 960px) {
  .demo {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    align-items: start;
  }

  .demo__live {
    position: sticky;
    top: calc(var(--vp-nav-height) + 24px);
  }

  .demo__form {
    padding: 32px;
  }
}
</style>
