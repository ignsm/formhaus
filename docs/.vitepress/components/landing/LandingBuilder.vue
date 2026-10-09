<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import AutoInput from './AutoInput.vue';
import BuilderBreak from './BuilderBreak.vue';
import BuilderGutter from './BuilderGutter.vue';
import BuilderQuestion from './BuilderQuestion.vue';
import { laterPages, newPage, newQuestion, type BuilderForm } from './builder-model';
import './builder.css';

const props = defineProps<{ form: BuilderForm }>();
const emit = defineEmits<{ page: [group: number] }>();

const root = ref<HTMLElement>();
const title = ref<InstanceType<typeof AutoInput>>();
const edited = ref(false);
const sweep = ref(false);
const first = computed(() => props.form.blocks.find((block) => block.kind === 'question')?.uid);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || !root.value?.offsetParent) return;
    observer?.disconnect();
    if (window.matchMedia('(pointer: coarse)').matches) return;
    title.value?.focus({ preventScroll: true });
    sweep.value = true;
    setTimeout(() => {
      sweep.value = false;
      if (!edited.value && root.value?.querySelector('.nb-title .auto__input') === document.activeElement) title.value?.blur();
    }, 1200);
  }, { threshold: 0.5 });
  if (root.value) observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());

const inputs = () => [...(root.value?.querySelectorAll<HTMLInputElement>('.nb-doc .auto__input') ?? [])];

async function focusUid(uid: string) {
  await nextTick();
  root.value?.querySelector<HTMLInputElement>(`[data-uid="${uid}"] .auto__input`)?.focus();
}

async function focusBefore(index: number) {
  await nextTick();
  const before = index > 0 ? [...(root.value?.querySelectorAll(`[data-uid="${props.form.blocks[index - 1].uid}"] .auto__input`) ?? [])].pop() : undefined;
  const input = (before ?? root.value?.querySelector('.nb-title .auto__input')) as HTMLInputElement | null;
  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);
}

function touch() {
  edited.value = true;
}

function insertQuestion(index: number) {
  const question = newQuestion();
  props.form.blocks.splice(index + 1, 0, question);
  touch();
  focusUid(question.uid);
}

function toPage(index: number) {
  const page = newPage('');
  props.form.blocks.splice(index, 1, page);
  touch();
  focusUid(page.uid);
}

function onlyQuestion(index: number) {
  const prev = props.form.blocks[index - 1];
  const next = props.form.blocks[index + 1];
  return (!prev || prev.kind === 'page') && (!next || next.kind === 'page');
}

function remove(index: number) {
  const block = props.form.blocks[index];
  if ((block.kind === 'question' && onlyQuestion(index)) || (block.kind === 'page' && index === 0)) return focusBefore(index);
  props.form.blocks.splice(index, 1);
  touch();
  focusBefore(index);
}

function move(index: number, delta: number) {
  const target = index + delta;
  const list = props.form.blocks;
  if (target < 0 || target >= list.length) return;
  list.splice(target, 0, ...list.splice(index, 1));
  touch();
}

function lastOfPage(index: number) {
  const next = props.form.blocks[index + 1];
  return props.form.blocks[index].kind === 'question' && (!next || next.kind === 'page');
}

function onFocusIn(index: number) {
  const pagesUpTo = props.form.blocks.slice(0, index + 1).filter((block) => block.kind === 'page').length;
  emit('page', Math.max(0, pagesUpTo - (props.form.blocks[0]?.kind === 'page' ? 1 : 0)));
}

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if ((event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || !target.classList.contains('auto__input')) return;
  const list = inputs();
  const next = list[list.indexOf(target as HTMLInputElement) + (event.key === 'ArrowUp' ? -1 : 1)];
  if (!next) return;
  event.preventDefault();
  next.focus();
}
</script>

<template>
  <div ref="root" class="nb" :data-sweep="sweep">
    <div class="nb-doc" @keydown="onKey">
      <p v-if="!edited" class="nb-hint">Type a question. Add → Team on an option to branch.</p>
      <div class="nb-line nb-title">
        <AutoInput ref="title" v-model="form.title" placeholder="Untitled form" label="Form title" @input="touch" />
      </div>
      <div v-for="(block, index) in form.blocks" :key="block.uid" class="nb-row" :class="{ 'nb-first': block.uid === first }" @focusin="onFocusIn(index)">
        <BuilderBreak v-if="block.kind === 'page'" :page="block" @after="insertQuestion(index)" @remove="remove(index)" @edit="touch" />
        <template v-else>
          <BuilderGutter @insert="insertQuestion(index)" @move="(delta) => move(index, delta)" @remove="remove(index)" />
          <BuilderQuestion
            :question="block"
            :pages="laterPages(form, index).map((page) => page.title)"
            @after="insertQuestion(index)"
            @remove="remove(index)"
            @page="toPage(index)"
            @edit="touch"
          />
          <button v-if="lastOfPage(index)" type="button" class="nb-plus" @click="insertQuestion(index)">+ question</button>
        </template>
      </div>
      <div class="nb-line nb-submit">
        <span class="nb-chip"><AutoInput v-model="form.submit" placeholder="Submit" label="Submit button label" @input="touch" /></span>
      </div>
    </div>
  </div>
</template>
