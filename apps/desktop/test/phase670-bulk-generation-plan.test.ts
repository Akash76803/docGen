/**
 * Phase 6.7 — Bulk Generation Plan Tests
 * Validates the pure planner is deterministic, isolation-safe, and filename-correct.
 */
import { describe, it, expect } from 'vitest';
import {
  createBulkGenerationPlan,
  type BulkCardGenerationRequest,
} from '../src/services/cardBulkGeneration.js';
import {
  expandFilenameTemplate,
  deduplicateFilename,
} from '../src/services/previewRecordHelpers.js';
import type { DesignTemplate } from '@document-tool/contracts';

// ─── Minimal fixture helpers ─────────────────────────────────────────────────

function makeTemplate(artboardCount = 2): DesignTemplate {
  const artboards = Array.from({ length: artboardCount }, (_, i) => ({
    id: `ab-${i}`,
    name: i === 0 ? 'Front' : i === 1 ? 'Back' : `Side-${i}`,
    order: i,
    widthMm: 90,
    heightMm: 50,
    elements: [],
    groups: [],
    guides: [],
    visible: true,
  }));
  return {
    kind: 'CARD_DESIGN',
    schemaVersion: 1,
    id: 'template-test',
    name: 'Test Template',
    version: 1,
    status: 'DRAFT',
    artboards,
    sharedAssets: [],
  } as any;
}

const ROWS = [
  { Name: 'Alice', EmployeeId: 'EMP001', QR: 'qr-alice', Barcode: 'BC001', Visible: 'true' },
  { Name: 'Bob',   EmployeeId: 'EMP002', QR: 'qr-bob',   Barcode: 'BC002', Visible: 'false' },
  { Name: 'Carol', EmployeeId: 'EMP003', QR: 'qr-carol', Barcode: 'BC003', Visible: 'true' },
];

function req(overrides: Partial<BulkCardGenerationRequest> = {}): BulkCardGenerationRequest {
  return {
    recordTarget: 'ALL_RECORDS',
    currentRecordIndex: 0,
    artboardTarget: 'ALL',
    format: 'PDF',
    filenameTemplate: '{{recordIndex}}-{{artboardName}}',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 6.7 — Bulk Generation Planner', () => {

  describe('plan item count', () => {
    it('ALL_RECORDS + ALL artboards = rows × artboards items', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req());
      expect(plan.items).toHaveLength(ROWS.length * 2); // 3 records × 2 artboards
    });
    it('CURRENT_RECORD produces exactly artboard-count items', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req({ recordTarget: 'CURRENT_RECORD', currentRecordIndex: 1 }));
      expect(plan.items).toHaveLength(2);
      expect(plan.items[0]!.recordIndex).toBe(1);
    });
    it('SELECTED_RECORDS produces count × artboards', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req({ recordTarget: 'SELECTED_RECORDS', selectedRecordIndexes: [0, 2] }));
      expect(plan.items).toHaveLength(4); // 2 records × 2 artboards
    });
    it('empty rows produces empty plan', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), [], req());
      expect(plan.items).toHaveLength(0);
    });
    it('0 selected records produces no items when SELECTED', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req({ recordTarget: 'SELECTED_RECORDS', selectedRecordIndexes: [] }));
      expect(plan.items).toHaveLength(0);
    });
  });

  describe('record-major ordering', () => {
    it('items follow R1-Front, R1-Back, R2-Front, R2-Back order', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req());
      const labels = plan.items.map(i => `${i.recordIndex}/${i.artboard.name}`);
      expect(labels).toEqual([
        '0/Front', '0/Back',
        '1/Front', '1/Back',
        '2/Front', '2/Back',
      ]);
    });
  });

  describe('artboard target', () => {
    it('CURRENT artboard produces 1 artboard per record', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req({ artboardTarget: 'CURRENT', currentArtboardId: 'ab-0' }));
      expect(plan.items).toHaveLength(ROWS.length * 1);
      plan.items.forEach(item => expect(item.artboard.id).toBe('ab-0'));
    });
    it('SELECTED artboards uses only selected IDs', () => {
      const plan = createBulkGenerationPlan(makeTemplate(3), ROWS, req({ artboardTarget: 'SELECTED', selectedArtboardIds: ['ab-1', 'ab-2'] }));
      expect(plan.items).toHaveLength(ROWS.length * 2);
      plan.items.forEach(item => expect(['ab-1', 'ab-2']).toContain(item.artboard.id));
    });
    it('ALL artboards produces all artboards per record', () => {
      const plan = createBulkGenerationPlan(makeTemplate(3), ROWS, req({ artboardTarget: 'ALL' }));
      expect(plan.items).toHaveLength(ROWS.length * 3);
    });
  });

  describe('context isolation per record', () => {
    it('context.record for each item is the correct row', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req());
      expect(plan.items[0]!.context.record['Name']).toBe('Alice');
      expect(plan.items[1]!.context.record['Name']).toBe('Bob');
      expect(plan.items[2]!.context.record['Name']).toBe('Carol');
    });
    it('context for same-record front/back items is equal', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req());
      // R0 Front and R0 Back must have the same context
      const frontCtx = plan.items[0]!.context;
      const backCtx = plan.items[1]!.context;
      expect(frontCtx).toEqual(backCtx);
    });
    it('QR and Barcode values do not leak across records', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req());
      expect(plan.items[0]!.context.record['QR']).toBe('qr-alice');
      expect(plan.items[1]!.context.record['QR']).toBe('qr-bob');
      expect(plan.items[2]!.context.record['QR']).toBe('qr-carol');
    });
    it('visibility flag differs per record context', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req());
      expect(plan.items[0]!.context.record['Visible']).toBe('true');
      expect(plan.items[1]!.context.record['Visible']).toBe('false');
    });
    it('template source rows are not mutated after planning', () => {
      const copy = JSON.parse(JSON.stringify(ROWS));
      createBulkGenerationPlan(makeTemplate(2), ROWS, req());
      expect(ROWS).toEqual(copy);
    });
  });

  describe('filename construction', () => {
    it('default template produces recordIndex-artboardName', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req({ filenameTemplate: '{{recordIndex}}-{{artboardName}}', format: 'PNG' }));
      expect(plan.items[0]!.filename).toMatch(/^001-Front\.png$/);
    });
    it('datasource field token expands correctly', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req({ filenameTemplate: '{{EmployeeId}}-{{artboardName}}', format: 'PDF' }));
      expect(plan.items[0]!.filename).toMatch(/^EMP001-Front\.pdf$/i);
    });
    it('missing field falls back gracefully', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req({ filenameTemplate: '{{MissingField}}-card', format: 'PDF' }));
      // Should not throw and should produce a valid filename
      expect(plan.items[0]!.filename).toBeTruthy();
      expect(plan.items[0]!.filename).not.toContain('undefined');
    });
    it('unsafe chars in field value are sanitized', () => {
      const badRows = [{ Name: 'Alice/Bob:Bad' }];
      const template = makeTemplate(1);
      const plan = createBulkGenerationPlan(template, badRows, req({ filenameTemplate: '{{Name}}-card', format: 'PNG' }));
      expect(plan.items[0]!.filename).not.toMatch(/[/:*?"<>|]/);
    });
  });

  describe('filename collision handling', () => {
    it('duplicate filenames get unique suffixes', () => {
      // Two artboards with same name → would collide
      const templateDup: any = {
        ...makeTemplate(0),
        artboards: [
          { id: 'ab-0', name: 'Side', order: 0, widthMm:90, heightMm:50, elements:[], groups:[], guides:[], visible:true },
          { id: 'ab-1', name: 'Side', order: 1, widthMm:90, heightMm:50, elements:[], groups:[], guides:[], visible:true },
        ],
      };
      const plan = createBulkGenerationPlan(templateDup, ROWS.slice(0, 1), req({ filenameTemplate: '{{artboardName}}', format: 'PDF' }));
      const filenames = plan.items.map(i => i.filename);
      const unique = new Set(filenames);
      expect(unique.size).toBe(filenames.length); // all unique
    });
  });

  describe('plan metadata', () => {
    it('reports correct totalRecords and totalArtboards', () => {
      const plan = createBulkGenerationPlan(makeTemplate(2), ROWS, req());
      expect(plan.totalRecords).toBe(3);
      expect(plan.totalArtboards).toBe(2);
    });
    it('reports correct format', () => {
      const plan = createBulkGenerationPlan(makeTemplate(1), ROWS, req({ format: 'PNG' }));
      expect(plan.format).toBe('PNG');
    });
  });
});

describe('Phase 6.7 — Cancellation semantics (pure layer)', () => {
  it('plan with empty rows returns early without errors', () => {
    const plan = createBulkGenerationPlan(makeTemplate(2), [], req());
    expect(plan.items).toHaveLength(0);
    expect(plan.totalRecords).toBe(0);
  });
});
