import type { DocumentRenderer, RendererCapabilities, RendererRequest, RendererResult } from '@document-tool/renderer-sdk';
import { buildPdf, type PdfPage, type PdfImage } from './pdf-renderer.js';

const PT_PER_MM = 72 / 25.4;
const f = (n: number) => n.toFixed(2);
const mm = (v: number) => v * PT_PER_MM;

export type PageRasterizer = (documentGroupId: string, dpi: number) => Promise<{ bytes: Uint8Array; width: number; height: number; mimeType: string }>;

export class CardPdfExportRenderer implements DocumentRenderer {
  readonly format = 'PDF' as const;
  readonly version = '1.0.0';
  readonly capabilities: RendererCapabilities = {
    supportsPagination: true,
    supportsVectorText: false,
    supportsEditableText: false,
    supportsTransparency: false,
    supportsPageNumbers: false,
    supportsPasswordProtection: false,
    supportsMixedPageSizes: true
  };

  constructor(private readonly pageRasterizer?: PageRasterizer) {}

  async render(request: RendererRequest): Promise<RendererResult> {
    request.cancellationToken.throwIfCancellationRequested();
    
    if (!this.pageRasterizer) {
      throw new Error('PDF export requires a page rasterizer in this configuration.');
    }

    const images: PdfImage[] = [];
    const pages: PdfPage[] = [];

    const docModel = request.document.model as any; 
    const bleed = docModel.bleedMm || 0;
    const widthMm = (docModel.trimWidthMm || 210) + (bleed * 2);
    const heightMm = (docModel.trimHeightMm || 297) + (bleed * 2);
    
    const pageW = mm(widthMm);
    const pageH = mm(heightMm);
    
    // Rasterize full page
    const exportReqDpi = (request.options?.pdf as any)?.dpi || 300;
    const rasterResult = await this.pageRasterizer(request.document.documentGroupId, exportReqDpi);
    
    const imgName = `PageImage`;
    images.push({ name: imgName, bytes: rasterResult.bytes, width: rasterResult.width, height: rasterResult.height });
    
    const ops: string[] = [];
    ops.push(`q ${f(pageW)} 0 0 ${f(pageH)} 0 0 cm /${imgName} Do Q`);

    const annots: { rect: [number, number, number, number]; uri: string }[] = [];
    if (Array.isArray(docModel.elements)) {
      for (const e of docModel.elements) {
        const hyperlink = e.type === 'IMAGE' ? (e.content?.hyperlink || e.hyperlink) : undefined;
        if (hyperlink && typeof hyperlink === 'string') {
          const x = e.position.xMm;
          const y = e.position.yMm;
          const w = e.size.widthMm;
          const h = e.size.heightMm;

          const llx = mm(x + bleed);
          const lly = mm(heightMm - (y + bleed + h));
          const urx = mm(x + bleed + w);
          const ury = mm(heightMm - (y + bleed));

          annots.push({
            rect: [llx, lly, urx, ury],
            uri: hyperlink
          });
        }
      }
    }
    
    pages.push({ width: pageW, height: pageH, ops, annots: annots.length ? annots : undefined });

    const bytes = buildPdf(pages, images);
    
    const baseFileName = request.fileName || 'Card_Export';
    const finalFileName = baseFileName.toLowerCase().endsWith('.pdf') ? baseFileName : `${baseFileName}.pdf`;
    
    return {
      files: [{ fileName: finalFileName, mimeType: 'application/pdf', bytes }],
      pageCount: pages.length,
      warnings: []
    };
  }
}
