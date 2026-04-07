import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import PlaygroundSection from '../components/PlaygroundExamples.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlaygroundSection', PlaygroundSection);
  },
} satisfies Theme;
