<script setup lang="ts">
const groups = [
  {
    title: 'Recipes',
    items: [
      { title: 'Multi-step with branching', href: '/recipes/multi-step-branching' },
      { title: 'Conditional fields', href: '/recipes/conditional-fields' },
      { title: 'Quiz funnel', href: '/recipes/quiz-funnel' },
      { title: 'Headless engine', href: '/recipes/headless-engine' },
      { title: 'Figma to React', href: '/recipes/figma-to-react' },
      { title: 'AI agents', href: '/recipes/ai-agents' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'Next.js', href: '/guide/integrations/nextjs' },
      { title: 'Nuxt', href: '/guide/integrations/nuxt' },
      { title: 'shadcn/ui', href: '/guide/integrations/shadcn' },
      { title: 'Material UI', href: '/guide/integrations/mui' },
      { title: 'Vuetify', href: '/guide/integrations/vuetify' },
    ],
  },
];
</script>

<template>
  <section class="lp-section" aria-labelledby="recipes-title">
    <p class="lp-eyebrow">Examples</p>
    <h2 id="recipes-title" class="lp-title">Recipes and integrations</h2>
    <div v-for="group in groups" :key="group.title" class="recipes">
      <h3 class="recipes__title">{{ group.title }}</h3>
      <ul class="recipes__grid">
        <li v-for="item in group.items" :key="item.href">
          <a class="recipes__card" :href="item.href">
            <span class="recipes__name">{{ item.title }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.recipes {
  margin-top: 32px;
}

.vp-doc .recipes__title {
  margin: 0 0 12px;
  padding: 0;
  border: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.vp-doc .recipes__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.vp-doc .recipes__grid li {
  margin: 0;
}

.vp-doc .recipes__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s, background-color 0.2s;
}

.vp-doc .recipes__card:hover {
  border-color: var(--vp-c-brand-1);
}

.vp-doc .recipes__card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.recipes__name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
</style>
