import type { DesignBinding, DesignDataContext, DesignElement, Artboard, TextDesignElement } from '@document-tool/contracts';

/**
 * Resolves a dot-notation path against a record deterministically.
 * Disallows dangerous keys to prevent prototype pollution.
 */
export function resolvePath(record: Record<string, unknown> | undefined, path: string): unknown {
  if (!record || !path) return undefined;
  
  const parts = path.split('.');
  let current: any = record;
  
  for (const part of parts) {
    if (part === '__proto__' || part === 'constructor' || part === 'prototype') {
      return undefined; // Security: blocked paths
    }
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

export interface TextTemplateResolution {
  text: string;
  placeholders: string[];
  unresolved: string[];
}

export function extractTextPlaceholders(text: string): string[] {
  if (!text) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const placeholders: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1].trim());
  }
  return [...new Set(placeholders)];
}

export function hasDynamicTextTemplate(text: string): boolean {
  return /\{\{([^}]+)\}\}/.test(text ?? '');
}

export function resolveTextTemplate(
  sourceText: string,
  context: DesignDataContext
): TextTemplateResolution {
  if (!sourceText) {
    return { text: sourceText, placeholders: [], unresolved: [] };
  }

  const placeholders: string[] = [];
  const unresolved: string[] = [];

  const text = sourceText.replace(/\{\{([^}]+)\}\}/g, (...args) => {
    const inner = String(args[1] ?? '');
    const path = inner.trim();
    if (!path) return '';

    placeholders.push(path);
    const resolved = resolvePath(context.record, path);

    if (resolved === null || resolved === undefined) {
      unresolved.push(path);
      return '';
    }
    
    if (typeof resolved === 'object') {
      return '';
    }
    
    return String(resolved);
  });

  return { text, placeholders: [...new Set(placeholders)], unresolved: [...new Set(unresolved)] };
}

/**
 * Resolves a single binding against the provided data context.
 */
export function resolveDesignBinding(binding: DesignBinding, context: DesignDataContext): unknown {
  let resolved: unknown = undefined;

  switch (binding.sourceType) {
    case 'FIELD':
      if (binding.fieldPath) {
        resolved = resolvePath(context.record, binding.fieldPath);
      }
      break;
    case 'CALCULATED':
      if (binding.calculatedFieldId) {
        resolved = resolvePath(context.calculated, binding.calculatedFieldId);
      }
      break;
    case 'STATIC':
      resolved = binding.fallbackValue;
      break;
  }

  if (resolved === null || resolved === undefined) {
    resolved = binding.fallbackValue;
  }

  return resolved;
}

export function normalizeDynamicAssetSource(value: unknown, fallbackValue: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  if (typeof fallbackValue === 'string' && fallbackValue.trim() !== '') {
    return fallbackValue;
  }
  return undefined;
}

export function normalizeDynamicCodeValue(value: unknown, fallbackValue: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  if (typeof fallbackValue === 'string' && fallbackValue.trim() !== '') {
    return fallbackValue;
  }
  return typeof fallbackValue === 'string' ? fallbackValue : undefined;
}

/**
 * Validates and normalizes the target value for a specific property on a DesignElement.
 */
export function applyResolvedValueToElement(element: DesignElement, binding: DesignBinding, rawValue: unknown): void {
  const targetProperty = binding.targetProperty;
  // Do not mutate if undefined (fallback didn't exist and value was missing)
  if (rawValue === undefined) return;

  switch (targetProperty) {
    case 'text':
      if (element.type === 'TEXT') {
        let textValue = '';
        if (rawValue !== null) {
          if (typeof rawValue === 'boolean') {
            textValue = rawValue ? 'true' : 'false';
          } else {
            textValue = String(rawValue);
          }
        }
        (element as any).text = textValue;
      }
      break;

    case 'visible':
      if (typeof rawValue === 'boolean') {
        element.visible = rawValue;
      }
      // If it's not a boolean, we do not invent magic truthy logic in this phase.
      break;

    case 'source':
      if (element.type === 'IMAGE' || element.type === 'SVG') {
        const normalized = normalizeDynamicAssetSource(rawValue, binding.fallbackValue);
        if (normalized !== undefined) {
          (element as any).source = normalized;
        }
      }
      break;

    case 'altText':
      if (element.type === 'IMAGE') {
        if (typeof rawValue === 'string') {
          (element as any).altText = rawValue;
        }
      }
      break;

    case 'tintColor':
      if (element.type === 'SVG') {
        if (typeof rawValue === 'string') {
          (element as any).tintColor = rawValue;
        }
      }
      break;

    case 'value':
      if (element.type === 'QR' || element.type === 'BARCODE') {
        const normalized = normalizeDynamicCodeValue(rawValue, binding.fallbackValue);
        if (normalized !== undefined) {
          (element as any).value = normalized;
        }
      }
      break;
      
    // Future target properties (fill, stroke, etc.) go here
  }
}

/**
 * Resolves all bindings for a single design element, returning a newly cloned element
 * with the bindings applied. If no bindings exist, returns the original element.
 */
export function resolveElementBindings(element: DesignElement, context: DesignDataContext): DesignElement {
  const isTemplateMode = element.type === 'TEXT' && (element as TextDesignElement).textBindingMode === 'TEMPLATE';
  const hasBindings = element.bindings && element.bindings.length > 0;

  if (!hasBindings && !isTemplateMode) {
    return element; // Immutability: return unchanged if no bindings and not in template mode
  }

  // Clone element for runtime safety
  const resolvedElement = structuredClone(element);

  // If we are in TEMPLATE mode for text, resolve the mixed placeholders
  if (isTemplateMode) {
    const textElement = resolvedElement as unknown as TextDesignElement;
    const resolution = resolveTextTemplate(textElement.text, context);
    textElement.text = resolution.text;
  }

  // Then resolve any explicit property bindings (if ANY exist). 
  // If 'text' is also bound explicitly via bindings[], it will overwrite the template result,
  // which aligns with the fallback/override principle.
  if (hasBindings) {
    for (const binding of resolvedElement.bindings!) {
      const rawValue = resolveDesignBinding(binding, context);
      applyResolvedValueToElement(resolvedElement, binding, rawValue);
    }
  }

  return resolvedElement;
}

/**
 * Resolves an entire Artboard's elements against the given data context.
 * Returns a clone of the Artboard with resolved elements.
 */
export function resolveArtboardBindings(artboard: Artboard, context: DesignDataContext): Artboard {
  let hasChanges = false;
  
  const resolvedElements = artboard.elements.map(el => {
    const resolvedEl = resolveElementBindings(el, context);
    if (resolvedEl !== el) hasChanges = true;
    return resolvedEl;
  });

  if (!hasChanges) {
    return artboard; // Return original if perfectly unchanged
  }

  return {
    ...artboard,
    elements: resolvedElements
  };
}
