import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import PlaygroundSandpack from '../components/playground/PlaygroundSandpack.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingDemo from '../components/landing/LandingDemo.vue';
import LandingTabs from '../components/landing/LandingTabs.vue';
import LandingFigma from '../components/landing/LandingFigma.vue';
import LandingAgents from '../components/landing/LandingAgents.vue';
import LandingWhen from '../components/landing/LandingWhen.vue';
import LandingRecipes from '../components/landing/LandingRecipes.vue';
import './brand.css';
import './landing.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlaygroundSection', PlaygroundSandpack);
    app.component('LandingHero', LandingHero);
    app.component('LandingDemo', LandingDemo);
    app.component('LandingTabs', LandingTabs);
    app.component('LandingFigma', LandingFigma);
    app.component('LandingAgents', LandingAgents);
    app.component('LandingWhen', LandingWhen);
    app.component('LandingRecipes', LandingRecipes);
  },
} satisfies Theme;
