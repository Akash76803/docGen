import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const designer = fs.readFileSync(path.resolve(process.cwd(), 'apps/desktop/src/pages/CardDesigner.tsx'), 'utf8');

describe('Phase 8.5 Fix6 symmetric node UI wiring', () => {
  it('routes Shift+Click segment insertion through the symmetric insertion helper', () => {
    expect(designer).toContain('insertPathNodeWithSymmetry(');
    expect(designer).toContain('symmetryMode,');
    expect(designer).toContain('setPathSelectedNodeIds(prev => [...new Set([...prev, ...insertResult.insertedPointIds])])');
  });
});
