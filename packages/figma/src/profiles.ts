import { PLUGIN_NAMESPACE, readConfig, writeConfig, type Binding, type PluginConfig } from './config';
import { ROLES, type Role } from './roles';

export type ProfileBindings = Partial<Record<Role, Binding>>;

export interface Profile {
  id: string;
  name: string;
  bindings: ProfileBindings;
  origin?: string;
  useInNewFiles?: boolean;
}

const STORAGE_KEY = 'formhaus-profiles';
const DOCUMENT_KEY = 'documentId';

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function documentId(): string {
  const existing = figma.root.getSharedPluginData(PLUGIN_NAMESPACE, DOCUMENT_KEY);
  if (existing) return existing;
  const id = newId();
  figma.root.setSharedPluginData(PLUGIN_NAMESPACE, DOCUMENT_KEY, id);
  return id;
}

export async function listProfiles(): Promise<Profile[]> {
  const stored = await figma.clientStorage.getAsync(STORAGE_KEY).catch(() => undefined);
  return Array.isArray(stored) ? (stored as Profile[]) : [];
}

export async function updateProfiles(change: (profiles: Profile[]) => Profile[]): Promise<void> {
  await figma.clientStorage.setAsync(STORAGE_KEY, change(await listProfiles()));
}

function keyed(bindings: ProfileBindings, keepIds: boolean): ProfileBindings {
  const entries = ROLES
    .map((role) => [role, bindings[role]] as const)
    .filter((entry): entry is readonly [Role, Binding] => typeof entry[1]?.key === 'string')
    .map(([role, binding]) => [role, keepIds ? binding : { ...binding, source: 'library', id: undefined }]);
  return JSON.parse(JSON.stringify(Object.fromEntries(entries))) as ProfileBindings;
}

export function importedProfile(input: unknown): Profile | null {
  const candidate = input as Partial<Profile> | null;
  if (!candidate || typeof candidate.name !== 'string' || !candidate.bindings || typeof candidate.bindings !== 'object') return null;
  const bindings = keyed(candidate.bindings, false);
  if (Object.keys(bindings).length === 0) return null;
  return { id: newId(), name: candidate.name.trim() || 'Design system', bindings };
}

export async function saveProfile(name: string, bindings: ProfileBindings, useInNewFiles?: boolean): Promise<Profile> {
  const kept = keyed(bindings, true);
  if (Object.keys(kept).length === 0) throw new Error('Bind at least one component before saving a design system.');
  const profiles = await listProfiles();
  const profile: Profile = { id: newId(), name: name.trim() || 'Design system', bindings: kept, origin: documentId(), useInNewFiles: useInNewFiles ?? profiles.length === 0 };
  await updateProfiles((list) => [...list.map((item) => (profile.useInNewFiles ? { ...item, useInNewFiles: false } : item)), profile]);
  return profile;
}

export async function addProfile(profile: Profile): Promise<void> {
  await updateProfiles((list) => [...list, profile]);
}

export function applyBindings(config: PluginConfig, profile: Profile): void {
  config.bindings = keyed(profile.bindings, profile.origin === documentId());
  config.source = 'custom';
}

export async function applyDefaultProfile(): Promise<string | null> {
  if (figma.root.getSharedPluginData(PLUGIN_NAMESPACE, 'config')) return null;
  const profile = (await listProfiles()).find((item) => item.useInNewFiles);
  if (!profile) return null;
  const config = readConfig();
  applyBindings(config, profile);
  writeConfig(config);
  return profile.name;
}
