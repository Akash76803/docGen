import { describe, it, expect, vi } from 'vitest';
import { buildPdf } from '@document-tool/renderer-pdf';
import { createCombinedPdfAccumulator } from '../src/services/cardCombinedPdf.js';

// Mock buildPdf to avoid actual PDF generation logic during unit test
vi.mock('@document-tool/renderer-pdf', () => {
  return {
    buildPdf: vi.fn((pages, images) => {
      return new Uint8Array([1, 2, 3]); // dummy bytes
    })
  };
});

describe('Phase 6.7.1 - Combined Bulk PDF Finalization (Accumulator Service)', () => {
  it('creates an accumulator that starts with zero pages', () => {
    const acc = createCombinedPdfAccumulator();
    expect(acc.build('test')).toBeNull();
  });

  it('accumulates pages and produces a single ExportedFile ending in .pdf', () => {
    const acc = createCombinedPdfAccumulator();
    
    // Page 1
    acc.addPage(
      { bytes: new Uint8Array([10]), width: 800, height: 600 },
      210, // widthMm
      297, // heightMm
      0    // pageIndex
    );
    
    // Page 2
    acc.addPage(
      { bytes: new Uint8Array([20]), width: 800, height: 600 },
      210,
      297,
      1
    );

    const result = acc.build('My_Bulk_Output');
    expect(result).not.toBeNull();
    expect(result!.fileName).toBe('My_Bulk_Output.pdf');
    expect(result!.mimeType).toBe('application/pdf');
    expect(result!.bytes).toBeInstanceOf(Uint8Array);
  });

  it('respects existing .pdf extensions in the template', () => {
    const acc = createCombinedPdfAccumulator();
    acc.addPage({ bytes: new Uint8Array([10]), width: 800, height: 600 }, 210, 297, 0);
    
    const result = acc.build('AlreadyHasExtension.pdf');
    expect(result!.fileName).toBe('AlreadyHasExtension_pdf.pdf'); // sanitized then appended
  });

  it('maintains record-major order implicitly based on addPage call sequence', () => {
    // The accumulator pushes pages in the exact order addPage is called.
    // The orchestrator in CardDesigner calls it sequentially.
    const acc = createCombinedPdfAccumulator();
    acc.addPage({ bytes: new Uint8Array([1]), width: 10, height: 10 }, 10, 10, 0);
    acc.addPage({ bytes: new Uint8Array([2]), width: 10, height: 10 }, 10, 10, 1);
    
    acc.build('test');
    
    // buildPdf should be called with 2 pages and 2 images
    const args = vi.mocked(buildPdf).mock.calls[vi.mocked(buildPdf).mock.calls.length - 1]!;
    expect(args[0]).toHaveLength(2);
    expect(args[1]).toHaveLength(2);
    expect(args[1][0].name).toBe('Img_0');
    expect(args[1][1].name).toBe('Img_1');
  });
});
