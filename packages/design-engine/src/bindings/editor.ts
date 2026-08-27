import type { DesignBinding, DesignElement, TextDesignElement, ImageDesignElement, SvgDesignElement, QrDesignElement, BarcodeDesignElement, DesignDataContext } from '@document-tool/contracts';

export function getTextBinding(element: DesignElement): DesignBinding | undefined {
  return element.bindings?.find(b => b.targetProperty === 'text');
}

export function setTextFieldBinding(element: TextDesignElement, fieldPath: string): TextDesignElement {
  const currentBinding = getTextBinding(element);
  const newBinding: DesignBinding = currentBinding
    ? { ...currentBinding, sourceType: 'FIELD', fieldPath }
    : {
        id: `${element.id}-text-binding`,
        targetProperty: 'text',
        sourceType: 'FIELD',
        fieldPath,
        fallbackValue: element.text,
      };

  const bindings = [...(element.bindings || []).filter(b => b.targetProperty !== 'text'), newBinding];
  return { ...element, bindings };
}

export function removeTextBinding(element: TextDesignElement): TextDesignElement {
  if (!element.bindings) return element;
  const newBindings = element.bindings.filter(b => b.targetProperty !== 'text');
  return {
    ...element,
    bindings: newBindings.length ? newBindings : undefined
  };
}

export function resolveDataContextSeeding(prev: DesignDataContext, importedRecord: Record<string, any>, source: 'IMPORTED' | 'MANUAL'): DesignDataContext {
  if (source === 'IMPORTED' || Object.keys(prev.record ?? {}).length === 0) {
    return { ...prev, record: importedRecord };
  }
  return prev;
}

export function getSourceBinding(element: DesignElement): DesignBinding | undefined {
  return element.bindings?.find(b => b.targetProperty === 'source');
}

export function setSourceFieldBinding<T extends ImageDesignElement | SvgDesignElement>(element: T, fieldPath: string, fallbackSource?: string): T {
  const currentBinding = getSourceBinding(element);
  const newBinding: DesignBinding = currentBinding
    ? { ...currentBinding, sourceType: 'FIELD', fieldPath }
    : {
        id: `${element.id}-source-binding`,
        targetProperty: 'source',
        sourceType: 'FIELD',
        fieldPath,
        fallbackValue: fallbackSource,
      };

  const bindings = [...(element.bindings || []).filter(b => b.targetProperty !== 'source'), newBinding];
  return { ...element, bindings } as T;
}

export function removeSourceBinding<T extends ImageDesignElement | SvgDesignElement>(element: T): T {
  if (!element.bindings) return element;
  const newBindings = element.bindings.filter(b => b.targetProperty !== 'source');
  return {
    ...element,
    bindings: newBindings.length ? newBindings : undefined
  } as T;
}

export function getValueBinding(element: DesignElement): DesignBinding | undefined {
  return element.bindings?.find(b => b.targetProperty === 'value');
}

export function setValueFieldBinding<T extends QrDesignElement | BarcodeDesignElement>(element: T, fieldPath: string): T {
  const currentBinding = getValueBinding(element);
  const newBinding: DesignBinding = currentBinding
    ? { ...currentBinding, sourceType: 'FIELD', fieldPath }
    : {
        id: `${element.id}-value-binding`,
        targetProperty: 'value',
        sourceType: 'FIELD',
        fieldPath,
        fallbackValue: element.value,
      };

  const bindings = [...(element.bindings || []).filter(b => b.targetProperty !== 'value'), newBinding];
  return { ...element, bindings } as T;
}

export function removeValueBinding<T extends QrDesignElement | BarcodeDesignElement>(element: T): T {
  if (!element.bindings) return element;
  const newBindings = element.bindings.filter(b => b.targetProperty !== 'value');
  return {
    ...element,
    bindings: newBindings.length ? newBindings : undefined
  } as T;
}
