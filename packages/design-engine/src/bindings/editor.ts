import type { DesignBinding, DesignElement, TextDesignElement, ImageDesignElement, SvgDesignElement, QrDesignElement, BarcodeDesignElement, ShapeDesignElement, PathDesignElement, DesignDataContext } from '@document-tool/contracts';

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


export function getFillImageSourceBinding(element: DesignElement): DesignBinding | undefined {
  return element.bindings?.find(b => b.targetProperty === 'fillImageSource');
}

export function setFillImageSourceFieldBinding<T extends ShapeDesignElement | PathDesignElement>(element: T, fieldPath: string): T {
  const currentBinding = getFillImageSourceBinding(element);
  const newBinding: DesignBinding = currentBinding
    ? { ...currentBinding, sourceType: 'FIELD', fieldPath, fallbackValue: undefined }
    : {
        id: `${element.id}-fill-image-source-binding`,
        targetProperty: 'fillImageSource',
        sourceType: 'FIELD',
        fieldPath,
      };

  const bindings = [...(element.bindings || []).filter(b => b.targetProperty !== 'fillImageSource'), newBinding];
  return { ...element, bindings } as T;
}

export function removeFillImageSourceBinding<T extends ShapeDesignElement | PathDesignElement>(element: T): T {
  if (!element.bindings) return element;
  const newBindings = element.bindings.filter(b => b.targetProperty !== 'fillImageSource');
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

export function getHyperlinkBinding(element: DesignElement): DesignBinding | undefined {
  return element.bindings?.find(b => b.targetProperty === 'hyperlink');
}

export function setHyperlinkFieldBinding<T extends ImageDesignElement>(element: T, fieldPath: string, fallbackHyperlink?: string): T {
  const currentBinding = getHyperlinkBinding(element);
  const newBinding: DesignBinding = currentBinding
    ? { ...currentBinding, sourceType: 'FIELD', fieldPath }
    : {
        id: `${element.id}-hyperlink-binding`,
        targetProperty: 'hyperlink',
        sourceType: 'FIELD',
        fieldPath,
        fallbackValue: fallbackHyperlink,
      };

  const bindings = [...(element.bindings || []).filter(b => b.targetProperty !== 'hyperlink'), newBinding];
  return { ...element, bindings } as T;
}

export function removeHyperlinkBinding<T extends ImageDesignElement>(element: T): T {
  if (!element.bindings) return element;
  const newBindings = element.bindings.filter(b => b.targetProperty !== 'hyperlink');
  return {
    ...element,
    bindings: newBindings.length ? newBindings : undefined
  } as T;
}
