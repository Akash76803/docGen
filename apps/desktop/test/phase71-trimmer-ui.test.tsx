/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Artboard, DesignShapeKind, PathDesignElement } from '@document-tool/contracts';
import { ElementLibraryPanel } from '../src/components/designer/ElementLibraryPanel';
import { DesignerContextToolbar } from '../src/components/designer/DesignerContextToolbar';

const stroke = { type: 'SOLID' as const, style: 'SOLID' as const, color: '#000000', widthMm: 0.5 };
const path = (segmentType: 'LINE' | 'CUBIC_BEZIER' = 'LINE'): PathDesignElement => ({ id: 'path', type: 'PATH', name: 'Path', position: { xMm: 0, yMm: 0 }, size: { widthMm: 20, heightMm: 10 }, rotationDeg: 0, opacity: 1, visible: true, locked: false, zIndex: 0, geometry: { points: [{ id: 'a', x: 0, y: 0, outHandle: segmentType === 'CUBIC_BEZIER' ? { x: 5, y: -5 } : undefined }, { id: 'b', x: 20, y: 0, inHandle: segmentType === 'CUBIC_BEZIER' ? { x: 15, y: -5 } : undefined }], segments: [{ id: 'segment', type: segmentType, fromPointId: 'a', toPointId: 'b' }], closed: false }, fill: { type: 'NONE' }, stroke });
const artboard = (element: PathDesignElement): Artboard => ({ id: 'artboard', name: 'Front', order: 0, widthMm: 90, heightMm: 50, displayUnit: 'MM', background: { type: 'SOLID', color: '#ffffff' }, print: { bleed: { topMm: 3, rightMm: 3, bottomMm: 3, leftMm: 3 }, safeArea: { topMm: 4, rightMm: 4, bottomMm: 4, leftMm: 4 } }, guides: [], groups: [], elements: [element] });

describe('Phase 7.1 Trimmer UI', () => {
  afterEach(cleanup);

  it('shows Trimmer, Flexible Line, and Half Circle in the existing library sections', () => {
    const shapes: DesignShapeKind[] = ['RECTANGLE', 'HALF_CIRCLE'];
    render(<ElementLibraryPanel onInsertText={vi.fn()} onInsertShape={vi.fn()} onUploadImage={vi.fn()} availableShapes={shapes} canTrim onSetInteractionMode={vi.fn()} />);
    expect(screen.getByText('Trimmer')).toBeDefined();
    expect(screen.getByText('Select Tool')).toBeDefined();
    expect(screen.getByText('Flexible Line')).toBeDefined();
    expect(screen.getByText('Half Circle')).toBeDefined();
  });

  it('allows explicit Select Tool to exit sticky Trimmer mode', () => {
    const setMode = vi.fn();
    render(<ElementLibraryPanel onInsertText={vi.fn()} onInsertShape={vi.fn()} onUploadImage={vi.fn()} availableShapes={['RECTANGLE']} interactionMode="TRIMMER" canTrim onSetInteractionMode={setMode} />);
    fireEvent.click(screen.getByText('Select Tool').closest('button')!);
    expect(setMode).toHaveBeenCalledWith('SELECT');
  });

  it('activates Trimmer without requiring a selected target', () => {
    const setMode = vi.fn();
    render(<ElementLibraryPanel onInsertText={vi.fn()} onInsertShape={vi.fn()} onUploadImage={vi.fn()} availableShapes={['RECTANGLE']} canTrim onSetInteractionMode={setMode} />);
    const trimmer = screen.getByText('Trimmer').closest('button') as HTMLButtonElement;
    expect(trimmer.disabled).toBe(false);
    fireEvent.click(trimmer);
    expect(setMode).toHaveBeenCalledWith('TRIMMER');
  });

  it('provides manual point-to-point controls and prioritizes a chosen start node', () => {
    const source = readFileSync(resolve(process.cwd(), 'apps/desktop/src/pages/CardDesigner.tsx'), 'utf8');
    expect(source).toContain('TRIM — Select second point');
    expect(source).toContain('Delete Segment');
    expect(source).toContain('Clear Trim Selection');
    expect(source).toContain('Switch Side');
    expect(source.indexOf("trimStartNodeId && !trimEndNodeId)||ev.shiftKey")).toBeLessThan(source.indexOf('hoveredInterval && hoveredInterval.segmentId === seg.id'));
  });

  it('shows line conversions only for a compatible selected line', () => {
    const element = path();
    render(<DesignerContextToolbar mode="PATH" sourceArtboard={artboard(element)} sourceElements={[element]} mutate={vi.fn()} pathEditMode={{ active: true, selectedNodeIds: [] }} interactionMode="EDIT_PATH" pathSelectedSegmentIds={['segment']} />);
    expect(screen.getByText('To Curve')).toBeDefined(); expect(screen.getByText('To Arc')).toBeDefined();
    expect(screen.queryByText('Flip Arc')).toBeNull();
  });

  it('hides line-only actions and enables Flip Arc for a selected cubic', () => {
    const element = path('CUBIC_BEZIER');
    render(<DesignerContextToolbar mode="PATH" sourceArtboard={artboard(element)} sourceElements={[element]} mutate={vi.fn()} pathEditMode={{ active: true, selectedNodeIds: [] }} interactionMode="EDIT_PATH" pathSelectedSegmentIds={['segment']} />);
    expect(screen.queryByText('To Curve')).toBeNull(); expect(screen.queryByText('To Arc')).toBeNull();
    expect(screen.getByText('Flip Arc')).toBeDefined();
  });
});

