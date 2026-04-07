import defaultComponentMap from './component-map.example.json';

export interface FieldMapping {
  formsConstructorVariant?: string;
  standalone?: boolean;
  standaloneKey?: string;
  variantProps?: Record<string, string>;
  missing?: boolean;
}

export interface ComponentMap {
  formsConstructorKey: string;
  formHelperTextKey?: string;
  buttonKey: string;
  fields: Record<string, FieldMapping>;
  textLayerNames: {
    label: string;
    placeholder: string;
    helperText: string;
  };
}

// ---- Configurable component map ----

let activeComponentMap: ComponentMap = defaultComponentMap as ComponentMap;

/**
 * Replace the active component map (e.g. after loading from figma.clientStorage).
 */
export function setComponentMap(map: ComponentMap): void {
  activeComponentMap = map;
}

/**
 * Return the active component map (custom or default).
 */
export function getComponentMap(): ComponentMap {
  return activeComponentMap;
}

/**
 * Reset to the bundled example component map.
 */
export function resetComponentMap(): void {
  activeComponentMap = defaultComponentMap as ComponentMap;
}

// ---- Derived helpers ----

export function getFormsConstructorKey(): string {
  return activeComponentMap.formsConstructorKey;
}

export function getButtonKey(): string {
  return activeComponentMap.buttonKey;
}

export function getTextLayers(): ComponentMap['textLayerNames'] {
  return activeComponentMap.textLayerNames;
}

export function getFields(): Record<string, FieldMapping> {
  return activeComponentMap.fields;
}

// ---- Layout constants (not configurable) ----

export const CARD_WIDTH = 400;
export const CARD_PADDING = 24;
export const CARD_INNER_WIDTH = CARD_WIDTH - CARD_PADDING * 2; // 352
export const CARD_GAP = 40;
