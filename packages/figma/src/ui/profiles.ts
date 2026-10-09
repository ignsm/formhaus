import type { Profile } from '../profiles';
import { byId, element } from './dom';
import { decodeProfile, encodeProfile } from './profile-code';

type Post = (message: Record<string, unknown>) => void;
type Mode = 'idle' | 'save' | 'paste' | 'copy' | 'delete';

function button(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const node = element('button', className, label);
  node.type = 'button';
  node.onclick = onClick;
  return node;
}

function field(placeholder: string, value = ''): HTMLInputElement {
  const node = element('input', 'input');
  node.placeholder = placeholder;
  node.value = value;
  node.setAttribute('aria-label', placeholder);
  return node;
}

export function createProfilesBar(post: Post, show: (text: string, tone?: 'error' | 'success') => void) {
  const root = byId('profiles');
  let profiles: Profile[] = [];
  let selected = '';
  let mode: Mode = 'idle';
  let canSave = false;

  function inline(input: HTMLInputElement, action: string, onSubmit: () => void): HTMLElement {
    const row = element('div', 'profile-inline');
    input.onkeydown = (event) => event.key === 'Enter' && onSubmit();
    row.append(input, button(action, 'btn btn-primary btn-small', onSubmit), button('Cancel', 'btn btn-secondary btn-small', () => setMode('idle')));
    return row;
  }

  function extra(): HTMLElement | null {
    if (mode === 'save') {
      const input = field('Design system name', 'My design system');
      return inline(input, 'Save', () => { post({ type: 'saveProfile', name: input.value }); setMode('idle'); });
    }
    if (mode === 'paste') {
      const input = field('Paste a setup code');
      return inline(input, 'Add', () => {
        try {
          post({ type: 'importProfile', profile: decodeProfile(input.value) });
          setMode('idle');
        } catch {
          show('That setup code is not valid.', 'error');
        }
      });
    }
    const profile = profiles.find((item) => item.id === selected);
    if (mode === 'delete' && profile) {
      const row = element('div', 'profile-inline');
      row.append(
        element('span', 'hint grow', `Delete “${profile.name}” from your saved design systems?`),
        button('Delete', 'btn btn-secondary btn-small link-danger', () => { post({ type: 'deleteProfile', id: selected }); setMode('idle'); }),
        button('Cancel', 'btn btn-secondary btn-small', () => setMode('idle')),
      );
      return row;
    }
    if (mode === 'copy' && profile) {
      const input = field('Setup code', encodeProfile(profile));
      input.readOnly = true;
      const row = inline(input, 'Copy', () => {
        input.select();
        document.execCommand('copy');
        show('Setup code copied. Share it with a teammate.', 'success');
      });
      requestAnimationFrame(() => input.select());
      return row;
    }
    return null;
  }

  function picker(): HTMLElement {
    const row = element('div', 'profile-row');
    const select = element('select');
    select.setAttribute('aria-label', 'Saved design system');
    for (const profile of profiles) {
      const option = element('option', '', profile.useInNewFiles ? `${profile.name} · new files` : profile.name);
      option.value = profile.id;
      select.appendChild(option);
    }
    select.value = selected;
    select.onchange = () => { selected = select.value; render(); };
    row.append(select, button('Use here', 'btn btn-primary btn-small', () => post({ type: 'applyProfile', id: selected })));
    return row;
  }

  function actions(): HTMLElement {
    const row = element('div', 'profile-actions');
    const current = profiles.find((item) => item.id === selected);
    if (current) {
      const toggle = element('label', 'profile-check');
      const box = element('input');
      box.type = 'checkbox';
      box.checked = Boolean(current.useInNewFiles);
      box.onchange = () => post({ type: 'toggleNewFiles', id: selected });
      toggle.append(box, document.createTextNode('Use in new files'));
      row.append(toggle, button('Copy setup code', 'link', () => setMode('copy')), button('Delete', 'link link-danger', () => setMode('delete')));
      return row;
    }
    const save = button('Save as design system', 'link', () => setMode('save'));
    save.disabled = !canSave;
    row.append(save, button('Paste setup code', 'link', () => setMode('paste')));
    return row;
  }

  function more(): HTMLElement | null {
    if (!profiles.length) return null;
    const row = element('div', 'profile-actions secondary');
    const save = button('Save current as new', 'link', () => setMode('save'));
    save.disabled = !canSave;
    row.append(save, button('Paste setup code', 'link', () => setMode('paste')));
    return row;
  }

  function render(): void {
    const head = element('div', 'profile-head');
    head.appendChild(element('div', 'section-label', 'Design system'));
    if (!profiles.length) head.appendChild(element('div', 'hint', 'Save these bindings to reuse them in other files, or paste a setup code from a teammate.'));
    root.replaceChildren(...[head, profiles.length ? picker() : null, actions(), more(), extra()].filter((node): node is HTMLElement => Boolean(node)));
  }

  function setMode(next: Mode): void {
    mode = next;
    render();
    root.querySelector<HTMLInputElement>('.profile-inline .input')?.focus();
  }

  return {
    update(next: Profile[], hasBindings: boolean) {
      profiles = next;
      canSave = hasBindings;
      if (!profiles.some((item) => item.id === selected)) selected = profiles.find((item) => item.useInNewFiles)?.id ?? profiles[0]?.id ?? '';
      render();
    },
  };
}
