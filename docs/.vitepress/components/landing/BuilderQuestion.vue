<script setup lang="ts">
import { nextTick, ref } from 'vue';
import AutoInput from './AutoInput.vue';
import BuilderMenu from './BuilderMenu.vue';
import {
  QUESTION_TYPES, SLASH_ITEMS, TYPE_ITEMS, hasOptions, newOption, setType,
  type BuilderOption, type BuilderQuestion, type QuestionType,
} from './builder-model';

const props = defineProps<{ question: BuilderQuestion; pages: string[] }>();
const emit = defineEmits<{ after: []; remove: []; page: []; edit: [] }>();

const menu = ref<'slash' | 'type' | null>(null);
const root = ref<HTMLElement>();
const typeLabel = (type: QuestionType) => QUESTION_TYPES.find((item) => item.type === type)?.label;
const known = (jump: string) => props.pages.some((page) => page.trim().toLowerCase() === jump.trim().toLowerCase());

async function focus(selector: string, end = true) {
  await nextTick();
  const input = root.value?.querySelector<HTMLInputElement>(selector);
  input?.focus();
  if (end && input) input.setSelectionRange(input.value.length, input.value.length);
}

function onTitleKey(event: KeyboardEvent) {
  if (event.key === '/' && !props.question.label) {
    event.preventDefault();
    menu.value = 'slash';
  } else if (event.key === 'Enter') {
    event.preventDefault();
    emit('after');
  } else if (event.key === 'Backspace' && !props.question.label) {
    event.preventDefault();
    emit('remove');
  }
}

function pick(id: string) {
  menu.value = null;
  if (id === 'page') return emit('page');
  setType(props.question, id as QuestionType);
  emit('edit');
  focus('.nb-question .auto__input');
}

function onOptionInput(option: BuilderOption) {
  emit('edit');
  if (props.question.type !== 'radio') return;
  const match = option.label.match(/\s*(->|→)\s*(.*)$/);
  if (!match) return;
  option.label = option.label.slice(0, match.index).trimEnd();
  option.jump = match[2];
  focus(`[data-option="${option.uid}"] .nb-jump .auto__input`);
}

function onOptionKey(event: KeyboardEvent, index: number) {
  const options = props.question.options;
  const option = options[index];
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!option.label && options.length > 1) {
      options.splice(index, 1);
      emit('after');
      return;
    }
    const next = newOption();
    options.splice(index + 1, 0, next);
    focus(`[data-option="${next.uid}"] .auto__input`);
  } else if (event.key === 'Backspace' && !option.label && options.length > 1) {
    event.preventDefault();
    options.splice(index, 1);
    focus(index ? `[data-option="${options[index - 1].uid}"] .auto__input` : '.nb-question .auto__input');
  }
}

function onJumpKey(event: KeyboardEvent, option: BuilderOption, index: number) {
  if (event.key === 'Backspace' && !option.jump) {
    event.preventDefault();
    option.jump = null;
    focus(`[data-option="${option.uid}"] .auto__input`);
  } else if (event.key === 'Enter') {
    onOptionKey(event, index);
  }
}
</script>

<template>
  <div ref="root" class="nb-block" :data-uid="question.uid">
    <div class="nb-line nb-question">
      <AutoInput v-model="question.label" placeholder="Type a question, or / for types" label="Question" @keydown="onTitleKey" @input="emit('edit')" />
      <span class="nb-anchor">
        <button type="button" class="nb-tag" :aria-label="`Type: ${typeLabel(question.type)}. Change type.`" @click="menu = 'type'">
          {{ typeLabel(question.type) }}
        </button>
        <BuilderMenu
          v-if="menu"
          :id="`${question.uid}-type`"
          :items="menu === 'slash' ? SLASH_ITEMS : TYPE_ITEMS"
          :current="question.type"
          label="Question type"
          @pick="pick"
          @close="menu = null"
        />
      </span>
      <button
        type="button"
        :class="question.required ? 'nb-tag' : 'nb-tag nb-tag--ghost'"
        :aria-pressed="question.required"
        aria-label="Required"
        @click="question.required = !question.required; emit('edit')"
      >
        {{ question.required ? 'required' : '+ required' }}
      </button>
    </div>
    <ul v-if="hasOptions(question.type)" class="nb-options" :aria-label="`Options for ${question.label || 'question'}`">
      <li v-for="(option, index) in question.options" :key="option.uid" class="nb-line nb-option" :data-option="option.uid">
        <span class="nb-glyph" :data-type="question.type" aria-hidden="true" />
        <AutoInput
          v-model="option.label"
          :placeholder="`Option ${index + 1}`"
          :label="`Option ${index + 1}`"
          @keydown="onOptionKey($event, index)"
          @input="onOptionInput(option)"
        />
        <span v-if="option.jump !== null" class="nb-jump" :data-known="known(option.jump)">
          <span aria-hidden="true">→</span>
          <AutoInput
            v-model="option.jump"
            placeholder="Page"
            :label="`Go to page after ${option.label || `option ${index + 1}`}`"
            :list="`${question.uid}-pages`"
            @keydown="onJumpKey($event, option, index)"
            @input="emit('edit')"
          />
        </span>
      </li>
    </ul>
    <datalist :id="`${question.uid}-pages`">
      <option v-for="page in pages" :key="page" :value="page" />
    </datalist>
  </div>
</template>
