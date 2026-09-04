/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ElementLibraryPanel } from '../src/components/designer/ElementLibraryPanel';

describe('Phase 7.0 Utility Tools UI', () => {
  const defaultProps = {
    onInsertText: vi.fn(),
    onInsertShape: vi.fn(),
    onUploadImage: vi.fn(),
    availableShapes: ['RECTANGLE', 'CIRCLE', 'POLYGON'] as any,
    interactionMode: 'SELECT' as const,
    onSetInteractionMode: vi.fn(),
    canEditPath: false,
    canScissors: false,
    canTrim: false,
    canJoin: false,
    onJoin: vi.fn(),
    canClose: false,
    onClose: vi.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  it('renders the utility section and core utility cards', () => {
    render(<ElementLibraryPanel {...defaultProps} />);
    
    expect(screen.getByText('Utility')).toBeDefined();
    expect(screen.getByText('Pen Tool')).toBeDefined();
    expect(screen.getByText('Edit Path')).toBeDefined();
    expect(screen.getByText('Scissors')).toBeDefined();
    expect(screen.getByText('Erase Segment')).toBeDefined();
    expect(screen.getByText('Join Path')).toBeDefined();
    expect(screen.getByText('Close Path')).toBeDefined();
  });

  it('Pen Tool active state works', () => {
    render(<ElementLibraryPanel {...defaultProps} interactionMode="PEN" />);
    
    const penBtn = screen.getByText('Pen Tool').closest('button');
    expect(penBtn?.className).toContain('active');
  });

  it('Edit Path, Scissors, and Erase Segment are disabled without PATH selected', () => {
    render(<ElementLibraryPanel {...defaultProps} canEditPath={false} canScissors={false} canTrim={false} />);
    
    expect((screen.getByText('Edit Path').closest('button') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByText('Scissors').closest('button') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByText('Erase Segment').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('Join Path is disabled unless two open PATHs are selected', () => {
    render(<ElementLibraryPanel {...defaultProps} canJoin={false} />);
    expect((screen.getByText('Join Path').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('Close Path is disabled for closed PATHs', () => {
    render(<ElementLibraryPanel {...defaultProps} canClose={false} />);
    expect((screen.getByText('Close Path').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('Utility search finds tool names', () => {
    const { rerender } = render(<ElementLibraryPanel {...defaultProps} />);
    
    // Default: all visible
    expect(screen.getByText('Pen Tool')).toBeDefined();
    expect(screen.getByText('Scissors')).toBeDefined();

    // Search 'trim'
    const searchInput = screen.getByPlaceholderText('Search elements...');
    fireEvent.change(searchInput, { target: { value: 'trim' } });
    
    expect(screen.getByText('Erase Segment')).toBeDefined();
    expect(screen.queryByText('Scissors')).toBeNull();
    expect(screen.queryByText('Pen Tool')).toBeNull();
  });

  it('Utility actions use existing handlers', () => {
    render(<ElementLibraryPanel {...defaultProps} canEditPath={true} canScissors={true} canTrim={true} canJoin={true} canClose={true} />);
    
    fireEvent.click(screen.getByText('Pen Tool').closest('button')!);
    expect(defaultProps.onSetInteractionMode).toHaveBeenCalledWith('PEN');

    fireEvent.click(screen.getByText('Edit Path').closest('button')!);
    expect(defaultProps.onSetInteractionMode).toHaveBeenCalledWith('EDIT_PATH');

    fireEvent.click(screen.getByText('Scissors').closest('button')!);
    expect(defaultProps.onSetInteractionMode).toHaveBeenCalledWith('SCISSORS');

    fireEvent.click(screen.getByText('Erase Segment').closest('button')!);
    expect(defaultProps.onSetInteractionMode).toHaveBeenCalledWith('TRIMMER');

    fireEvent.click(screen.getByText('Join Path').closest('button')!);
    expect(defaultProps.onJoin).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Close Path').closest('button')!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
