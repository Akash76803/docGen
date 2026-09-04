import { describe, it, expect } from 'vitest';
import {
  clampPreviewRecordIndex,
  getPreviewRecord,
  createRecordDesignDataContext,
  getRecordDisplayLabel,
  sanitizeFilenameSegment,
  expandFilenameTemplate,
  deduplicateFilename,
} from '../src/services/previewRecordHelpers.js';

const ROWS = [
  { Name: 'Alice', EmployeeId: 'EMP001', QR: 'https://example.com/1', Barcode: '1111111111', Status: 'active' },
  { Name: 'Bob',   EmployeeId: 'EMP002', QR: 'https://example.com/2', Barcode: '2222222222', Status: 'draft' },
  { Name: 'Carol', EmployeeId: 'EMP003', QR: 'https://example.com/3', Barcode: '3333333333', Status: 'inactive' },
];

describe('Phase 6.6.8 – Preview Record Context Helpers', () => {

  describe('clampPreviewRecordIndex', () => {
    it('returns 0 for empty rows', () => {
      expect(clampPreviewRecordIndex(5, 0)).toBe(0);
    });
    it('clamps below 0', () => {
      expect(clampPreviewRecordIndex(-3, 3)).toBe(0);
    });
    it('clamps above max', () => {
      expect(clampPreviewRecordIndex(99, 3)).toBe(2);
    });
    it('passes valid index through', () => {
      expect(clampPreviewRecordIndex(1, 3)).toBe(1);
    });
  });

  describe('getPreviewRecord', () => {
    it('returns empty object for 0 rows', () => {
      expect(getPreviewRecord([], 0)).toEqual({});
    });
    it('returns first record', () => {
      expect(getPreviewRecord(ROWS, 0)).toEqual(ROWS[0]);
    });
    it('returns second record', () => {
      expect(getPreviewRecord(ROWS, 1)).toEqual(ROWS[1]);
    });
    it('clamps out-of-range index safely', () => {
      expect(getPreviewRecord(ROWS, 100)).toEqual(ROWS[ROWS.length - 1]);
    });
  });

  describe('createRecordDesignDataContext', () => {
    it('wraps record in DesignDataContext shape', () => {
      const ctx = createRecordDesignDataContext({ Name: 'Alice' });
      expect(ctx.record).toEqual({ Name: 'Alice' });
    });
    it('different records produce different contexts', () => {
      const ctxA = createRecordDesignDataContext(ROWS[0]!);
      const ctxB = createRecordDesignDataContext(ROWS[1]!);
      expect(ctxA.record).not.toBe(ctxB.record);
    });
  });

  describe('record navigation semantics', () => {
    it('navigating from index 0 to 1 returns different record', () => {
      const r0 = getPreviewRecord(ROWS, 0);
      const r1 = getPreviewRecord(ROWS, 1);
      expect(r0['Name']).toBe('Alice');
      expect(r1['Name']).toBe('Bob');
    });
    it('same index always returns same record — no leakage', () => {
      const a = getPreviewRecord(ROWS, 2);
      const b = getPreviewRecord(ROWS, 2);
      expect(a).toEqual(b);
    });
    it('source rows remain immutable after reads', () => {
      const copy = [...ROWS];
      getPreviewRecord(ROWS, 0);
      getPreviewRecord(ROWS, 1);
      expect(ROWS).toEqual(copy);
    });
    it('datasource replacement resets to index 0 safely', () => {
      const newRows = [{ Name: 'Dave', EmployeeId: 'EMP099' }];
      const idx = clampPreviewRecordIndex(2, newRows.length); // previous index 2, only 1 row now
      expect(idx).toBe(0);
      expect(getPreviewRecord(newRows, idx)).toEqual(newRows[0]);
    });
  });

  describe('multiple artboards share same record', () => {
    it('given recordIndex=1, all artboards see record 1', () => {
      const artboards = ['front', 'back'];
      const resolvedRecords = artboards.map(() => getPreviewRecord(ROWS, 1));
      expect(resolvedRecords[0]).toEqual(resolvedRecords[1]);
      expect(resolvedRecords[0]!['Name']).toBe('Bob');
    });
    it('switching active artboard does NOT change record', () => {
      const recordBefore = getPreviewRecord(ROWS, 1);
      // Simulate artboard switch (no index change)
      const recordAfter = getPreviewRecord(ROWS, 1);
      expect(recordBefore).toEqual(recordAfter);
    });
  });

  describe('getRecordDisplayLabel', () => {
    it('returns EmployeeId if present', () => {
      expect(getRecordDisplayLabel({ EmployeeId: 'EMP001' }, 0)).toBe('EMP001');
    });
    it('falls back to "Record N" for no label fields', () => {
      expect(getRecordDisplayLabel({ unknown: 'x' }, 5)).toBe('Record 6');
    });
  });

  describe('QR/Barcode per record', () => {
    it('QR value does not leak across records', () => {
      const ctx0 = createRecordDesignDataContext(ROWS[0]!);
      const ctx1 = createRecordDesignDataContext(ROWS[1]!);
      expect(ctx0.record['QR']).toBe('https://example.com/1');
      expect(ctx1.record['QR']).toBe('https://example.com/2');
    });
    it('Barcode value does not leak across records', () => {
      const ctx0 = createRecordDesignDataContext(ROWS[0]!);
      const ctx2 = createRecordDesignDataContext(ROWS[2]!);
      expect(ctx0.record['Barcode']).toBe('1111111111');
      expect(ctx2.record['Barcode']).toBe('3333333333');
    });
  });

  describe('conditional visibility per record', () => {
    it('status=active resolves differently from status=draft', () => {
      const r0 = getPreviewRecord(ROWS, 0);
      const r1 = getPreviewRecord(ROWS, 1);
      expect(r0['Status']).toBe('active');
      expect(r1['Status']).toBe('draft');
    });
  });
});

describe('previewRecordHelpers – filename utilities', () => {
  describe('sanitizeFilenameSegment', () => {
    it('removes forbidden chars', () => {
      expect(sanitizeFilenameSegment('hello:world/test')).not.toMatch(/[:\/]/);
    });
    it('returns unnamed for empty string', () => {
      expect(sanitizeFilenameSegment('')).toBe('unnamed');
    });
    it('strips path traversal', () => {
      expect(sanitizeFilenameSegment('../secret')).not.toContain('..');
    });
  });

  describe('expandFilenameTemplate', () => {
    it('expands {{recordIndex}}', () => {
      const result = expandFilenameTemplate('card-{{recordIndex}}', {}, 4, 'Front');
      expect(result).toContain('005');
    });
    it('expands {{artboardName}}', () => {
      const result = expandFilenameTemplate('{{artboardName}}-out', {}, 0, 'Front Side');
      expect(result).toContain('Front_Side');
    });
    it('expands datasource field token', () => {
      const result = expandFilenameTemplate('{{EmployeeId}}-card', { EmployeeId: 'EMP001' }, 0, 'Front');
      expect(result).toBe('EMP001-card');
    });
    it('falls back when field is missing', () => {
      const result = expandFilenameTemplate('{{MissingField}}-front', {}, 2, 'Front');
      expect(result).toContain('record-3');
    });
    it('sanitizes unsafe characters from field values', () => {
      const result = expandFilenameTemplate('{{Name}}-out', { Name: 'Alice/Bob' }, 0, 'Front');
      expect(result).not.toContain('/');
    });
  });

  describe('deduplicateFilename', () => {
    it('returns unchanged if not in set', () => {
      const used = new Set<string>();
      expect(deduplicateFilename('file.pdf', used)).toBe('file.pdf');
    });
    it('appends -2 on first collision', () => {
      const used = new Set(['file.pdf']);
      expect(deduplicateFilename('file.pdf', used)).toBe('file-2.pdf');
    });
    it('appends -3 on second collision', () => {
      const used = new Set(['file.pdf', 'file-2.pdf']);
      expect(deduplicateFilename('file.pdf', used)).toBe('file-3.pdf');
    });
    it('adds to set after returning', () => {
      const used = new Set<string>();
      deduplicateFilename('card.png', used);
      expect(used.has('card.png')).toBe(true);
    });
  });
});
