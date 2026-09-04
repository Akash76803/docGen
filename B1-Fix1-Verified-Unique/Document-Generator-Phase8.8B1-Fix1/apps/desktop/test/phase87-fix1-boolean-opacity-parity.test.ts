import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const designer = fs.readFileSync(path.join(repoRoot, 'apps/desktop/src/pages/CardDesigner.tsx'), 'utf8');
const toolbar = fs.readFileSync(path.join(repoRoot, 'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'), 'utf8');
const booleanUtils = fs.readFileSync(path.join(repoRoot, 'packages/design-engine/src/booleanUtils.ts'), 'utf8');
const exportCanvas = fs.readFileSync(path.join(repoRoot, 'apps/desktop/src/pages/CardExportCanvas.tsx'), 'utf8');

describe('Phase 8.7 Fix1 Boolean opacity parity', () => {
  it('treats PATH as batch-opacity compatible', () => {
    expect(designer).toContain("['TEXT','SHAPE','PATH','IMAGE','SVG']");
  });

  it('exposes a single PATH opacity control in the context toolbar', () => {
    expect(toolbar).toContain('data-path-opacity-control');
    expect(toolbar).toContain('aria-label="Path opacity"');
  });

  it('keeps primary/source element opacity explicit through Boolean + Fragment generation', () => {
    expect(booleanUtils).toContain('opacity: elA.opacity');
    expect(booleanUtils).toContain('opacity: source.opacity');
  });

  it('applies element opacity at both interactive and isolated-export shells', () => {
    expect(designer).toContain('opacity:e.runtimeHidden?e.opacity*0.4:e.opacity');
    expect(exportCanvas).toContain('opacity: e.opacity');
  });
});
