import type { DesignTemplate } from '@document-tool/contracts';
import { validateDesignTemplate } from './validation.js';
import type { DesignElementRegistry } from './element-registry.js';

export const CARD_DESIGN_SCHEMA_VERSION=1 as const;

export function serializeDesignTemplate(template:DesignTemplate, registry?:DesignElementRegistry):string {
  const result=validateDesignTemplate(template,registry);
  if (!result.valid) throw new Error(`Cannot serialize invalid card design template: ${result.errors.map(e=>e.message).join('; ')}`);
  return JSON.stringify(template);
}

export function deserializeDesignTemplate(serialized:string, registry?:DesignElementRegistry):DesignTemplate {
  let parsed:unknown;
  try { parsed=JSON.parse(serialized); } catch { throw new Error('Card design template is not valid JSON.'); }
  if (!parsed || typeof parsed!=='object' || (parsed as {kind?:unknown}).kind!=='CARD_DESIGN') throw new Error('File is not a Card Design template.');
  const template=parsed as DesignTemplate;
  if (template.schemaVersion!==CARD_DESIGN_SCHEMA_VERSION) throw new Error(`Unsupported Card Design schema version: ${String(template.schemaVersion)}.`);
  const result=validateDesignTemplate(template,registry);
  if (!result.valid) throw new Error(`Card design template validation failed: ${result.errors.map(e=>e.message).join('; ')}`);
  return template;
}
