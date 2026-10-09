<script setup lang="ts">
import { NODE, type FlowGraph } from './flow-graph';
import type { FlowState } from './flow-state';

defineProps<{ graph: FlowGraph; state: FlowState }>();
</script>

<template>
  <div class="flow" :style="{ '--flow-width': `${graph.width}px` }">
    <svg
      class="flow__svg"
      :viewBox="`0 0 ${graph.width} ${graph.height}`"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <TransitionGroup tag="g" name="flow-fade">
        <g v-for="edge in graph.edges" :key="edge.id" class="flow__edge" :data-state="state.edges[edge.id]">
          <path class="flow__track" :d="edge.d" />
          <path class="flow__line" :d="edge.d" pathLength="1" />
        </g>
      </TransitionGroup>
      <TransitionGroup tag="g" name="flow-fade">
        <g
          v-for="node in graph.nodes"
        :key="node.id"
        class="flow__node"
        :data-state="state.nodes[node.id]"
        :transform="`translate(${node.x} ${node.y})`"
      >
        <rect class="flow__box" :width="NODE.width" :height="NODE.height" rx="18" />
          <text class="flow__label" :x="NODE.width / 2" :y="NODE.height / 2">{{ node.label.length > 12 ? `${node.label.slice(0, 11)}…` : node.label }}</text>
        </g>
      </TransitionGroup>
    </svg>
    <p class="lp-sr-only" aria-live="polite">{{ state.summary }}</p>
  </div>
</template>

<style scoped>
.flow {
  height: 100%;
}

.flow__svg {
  display: block;
  width: 100%;
  max-width: 480px;
  height: 100%;
  margin: 0 auto;
  overflow: visible;
}

.flow__track {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
  stroke-dasharray: 2 5;
  stroke-linecap: round;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.flow__edge[data-state='open'] .flow__track {
  stroke-dasharray: 5 5;
  opacity: 1;
}

.flow__edge[data-state='dim'] .flow__track {
  opacity: 0.18;
}

.flow__edge[data-state='lit'] .flow__track,
.flow__edge[data-state='preview'] .flow__track {
  opacity: 0;
}

.flow__line {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition: stroke-dashoffset 0.5s ease, opacity 0s linear 0.5s;
}

.flow__edge[data-state='lit'] .flow__line,
.flow__edge[data-state='preview'] .flow__line {
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset 0.5s ease, opacity 0s;
}

.flow__box {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
  stroke-width: 1.5;
  transition: fill 0.3s, stroke 0.3s, opacity 0.3s;
}

.flow__label {
  fill: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: central;
  transition: fill 0.3s;
}

.flow__node[data-state='visited'] .flow__box {
  stroke: var(--vp-c-brand-1);
}

.flow__node[data-state='visited'] .flow__label {
  fill: var(--vp-c-text-1);
}

.flow__node[data-state='current'] .flow__box {
  fill: var(--vp-c-brand-3);
  stroke: var(--vp-c-brand-3);
}

.flow__node[data-state='current'] .flow__label {
  fill: #fff;
  font-weight: 600;
}

.flow__node {
  transition: opacity 0.3s;
}

.flow__node[data-state='skipped'] {
  opacity: 0.35;
}

.flow-fade-enter-active,
.flow-fade-leave-active {
  transition: opacity 0.2s;
}

.flow-fade-enter-from,
.flow-fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .flow__svg {
    width: calc(var(--flow-width) * 0.85);
    max-width: none;
    height: auto;
    margin: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-fade-enter-active,
  .flow-fade-leave-active,
  .flow__track,
  .flow__line,
  .flow__box,
  .flow__label,
  .flow__node {
    transition: none;
  }
}
</style>
