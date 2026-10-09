---
layout: home
title: "Formhaus — JSON form definition for React, Vue, Figma and AI agents"
titleTemplate: false
description: "Define fields, validation, conditional visibility and multi-step routes in one JSON form definition. Render it in React, Vue or Figma."
---

<LandingHero />

<LandingDemo>

<<< @/recipes/definitions/home-onboarding.json

</LandingDemo>

<LandingTabs>
<template #react>

```tsx
import { FormRenderer } from '@formhaus/react';
import '@formhaus/core/style.css';
import definition from './home-onboarding.json';

export function Onboarding() {
  return <FormRenderer definition={definition} onSubmit={(values) => save(values)} />;
}
```

</template>
<template #vue>

```vue
<script setup lang="ts">
import { FormRenderer } from '@formhaus/vue';
import '@formhaus/core/style.css';
import definition from './home-onboarding.json';
</script>

<template>
  <FormRenderer :definition="definition" @submit="save" />
</template>
```

</template>
<template #headless>

```ts
import { FormEngine } from '@formhaus/core';
import definition from './home-onboarding.json';

const engine = new FormEngine(definition);
engine.setValue('use', 'team');
await engine.nextStepAsync();
console.log(engine.currentStep?.id);

engine.setValue('company', 'Acme');
engine.setValue('size', '11-50');
await engine.nextStepAsync();
engine.setValue('email', 'team@acme.dev');
await engine.submitAsync(save);
```

</template>
<template #figma>

![The Formhaus Figma plugin editing a branching account form next to its flow map on the canvas](/figma/hero.png)

Paste the same JSON into the plugin.

</template>
</LandingTabs>

<LandingFigma />

<LandingAgents>

```json
{
  "$schema": "https://formhaus.dev/schema/form-definition.json"
}
```

</LandingAgents>

<LandingWhen />

<LandingRecipes />
