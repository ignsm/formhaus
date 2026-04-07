<script setup lang="ts">
const props = defineProps<{
  current: number;
  total: number;
  stepTitle?: string;
  stepDescription?: string;
}>();
</script>

<template>
  <div class="fh-step-progress">
    <div class="fh-step-progress__bar">
      <div
        class="fh-step-progress__fill"
        :style="{ width: `${(props.current / props.total) * 100}%` }"
      />
    </div>
    <div class="fh-step-progress__info">
      <span class="fh-step-progress__counter">Step {{ props.current }} of {{ props.total }}</span>
    </div>
    <h3 v-if="props.stepTitle" class="fh-step-progress__title">{{ props.stepTitle }}</h3>
    <p v-if="props.stepDescription" class="fh-step-progress__description">{{ props.stepDescription }}</p>
  </div>
</template>

<style scoped>
.fh-step-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fh-step-progress__bar {
  border-radius: 9999px;
  height: 4px;
  overflow: hidden;
  width: 100%;
}

.fh-step-progress__fill {
  border-radius: 9999px;
  height: 100%;
  transition: width 0.3s ease;
}

.fh-step-progress__info {
  display: flex;
  justify-content: space-between;
}

.fh-step-progress__title {
  margin: 0;
}

.fh-step-progress__description {
  margin: 0;
}
</style>
