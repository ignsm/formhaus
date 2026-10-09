<script setup lang="ts">
import LucideIcon from './LucideIcon.vue';

const fits = ['Forms stored as data', 'Multi-step flows with branches', 'One form in React and Vue', 'Forms written by agents'];

const others = [
  { text: 'One hand-written React form', pick: 'react-hook-form', href: '/compare/react-hook-form' },
  { text: 'Typed form state in code', pick: 'TanStack Form', href: '/compare/tanstack-form' },
  { text: 'Model already in JSON Schema', pick: 'react-jsonschema-form', href: '/compare/react-jsonschema-form' },
  { text: 'Scored surveys, visual builder', pick: 'SurveyJS', href: '/compare/surveyjs' },
];
</script>

<template>
  <section class="lp-section" aria-labelledby="when-title">
    <p class="lp-eyebrow">When to use Formhaus</p>
    <h2 id="when-title" class="lp-title">Pick the right tool</h2>
    <div class="when">
      <div class="when__col lp-card">
        <h3 class="when__title">Use Formhaus for</h3>
        <ul class="when__list">
          <li v-for="item in fits" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="when__col lp-card">
        <h3 class="when__title">Use something else for</h3>
        <ul class="when__list when__list--others">
          <li v-for="item in others" :key="item.pick">
            <span>{{ item.text }}</span>
            <a :href="item.href">{{ item.pick }}</a>
          </li>
        </ul>
      </div>
    </div>
    <a class="lp-more" href="/compare/">All comparisons <LucideIcon name="arrow-right" /></a>
  </section>
</template>

<style scoped>
.when {
  display: grid;
  gap: 16px;
  margin-top: 32px;
}

.when__col {
  min-width: 0;
  padding: 24px;
}

.vp-doc .when__title {
  margin: 0 0 12px;
  padding: 0;
  border: 0;
  font-size: 18px;
  line-height: 1.4;
}

.vp-doc .when__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.vp-doc .when__list li {
  margin: 0;
}

.vp-doc .when__list--others {
  padding-left: 0;
  list-style: none;
}

.vp-doc .when__list--others li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
}

.vp-doc .when__list--others a {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.vp-doc .when__list--others a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .when {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .vp-doc .when__list--others a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
}
</style>
