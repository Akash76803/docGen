import { describe, it, expect } from 'vitest';
import { getArtboardRole, formatArtboardRole, getArtboardPairLabel, getArtboardSelectionState, shouldShowCreateBackSide } from '../src/pages/artboard-ui-helpers.js';
import type { Artboard } from '@document-tool/contracts';

describe('Phase 6.4 Artboard UX Helpers', () => {
  describe('ROLE FALLBACK', () => {
    it('resolves undefined role to GENERIC', () => {
      expect(getArtboardRole(undefined)).toBe('GENERIC');
    });
    it('returns provided role', () => {
      expect(getArtboardRole('FRONT')).toBe('FRONT');
    });
  });

  describe('ROLE LABELS', () => {
    it('formats FRONT as Front', () => {
      expect(formatArtboardRole('FRONT')).toBe('Front');
    });
    it('formats BACK as Back', () => {
      expect(formatArtboardRole('BACK')).toBe('Back');
    });
    it('formats GENERIC and undefined as Generic', () => {
      expect(formatArtboardRole('GENERIC')).toBe('Generic');
      expect(formatArtboardRole(undefined)).toBe('Generic');
    });
  });

  describe('PAIR STATE', () => {
    it('returns null for unpaired artboard', () => {
      expect(getArtboardPairLabel('FRONT', undefined)).toBeNull();
    });
    it('returns paired label for FRONT', () => {
      expect(getArtboardPairLabel('FRONT', 'pair-1')).toBe('Paired with: Back');
    });
    it('returns paired label for BACK', () => {
      expect(getArtboardPairLabel('BACK', 'pair-1')).toBe('Paired with: Front');
    });
    it('returns generic paired label for GENERIC', () => {
      expect(getArtboardPairLabel('GENERIC', 'pair-1')).toBe('↔ Paired');
    });
  });

  describe('ACTIVE VS SELECTED', () => {
    it('identifies active artboard', () => {
      const state = getArtboardSelectionState('a1', 'a1', []);
      expect(state.isActive).toBe(true);
      expect(state.isSelected).toBe(false);
    });
    it('identifies selected artboard', () => {
      const state = getArtboardSelectionState('a2', 'a1', ['a2']);
      expect(state.isActive).toBe(false);
      expect(state.isSelected).toBe(true);
    });
    it('identifies active AND selected artboard', () => {
      const state = getArtboardSelectionState('a1', 'a1', ['a1', 'a2']);
      expect(state.isActive).toBe(true);
      expect(state.isSelected).toBe(true);
    });
  });

  describe('CREATE BACK SIDE VISIBILITY', () => {
    it('shows Create Back Side for eligible unpaired FRONT artboard', () => {
      const a = { role: 'FRONT', pairId: undefined } as Artboard;
      expect(shouldShowCreateBackSide(a)).toBe(true);
    });
    it('shows Create Back Side for eligible unpaired GENERIC artboard', () => {
      const a = { role: 'GENERIC', pairId: undefined } as Artboard;
      expect(shouldShowCreateBackSide(a)).toBe(true);
    });
    it('shows Create Back Side for undefined role artboard (resolves to GENERIC)', () => {
      const a = { pairId: undefined } as Artboard;
      expect(shouldShowCreateBackSide(a)).toBe(true);
    });
    it('hides Create Back Side for BACK artboards', () => {
      const a = { role: 'BACK', pairId: undefined } as Artboard;
      expect(shouldShowCreateBackSide(a)).toBe(false);
    });
    it('hides Create Back Side for already paired artboards', () => {
      const a = { role: 'FRONT', pairId: 'pair-1' } as Artboard;
      expect(shouldShowCreateBackSide(a)).toBe(false);
    });
  });
});
