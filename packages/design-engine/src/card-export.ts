import type { Artboard } from '@document-tool/contracts';

export interface CardExportRequest {
  format: 'PDF' | 'PNG' | 'JPEG';
  targetMode: 'CURRENT' | 'SELECTED' | 'ALL';
  selectedArtboardIds?: string[];
  currentArtboardId?: string;
  includeBleed: boolean;
  includeCropMarks: boolean;
  usePrintSettings: boolean;
  rasterDpi?: number;
  jpegQuality?: number;
  transparentBackground?: boolean;
}

import { resolvePrintSettings } from './print/index.js';

export function resolveCardExportGeometry(artboard: Artboard, request: CardExportRequest) {
  const printSettings = resolvePrintSettings(artboard.print);
  const trimWidthMm = artboard.widthMm;
  const trimHeightMm = artboard.heightMm;
  const isLandscape = trimWidthMm >= trimHeightMm;
  const bleed = request.includeBleed ? printSettings.bleed : { topMm: 0, rightMm: 0, bottomMm: 0, leftMm: 0 };
  const outputWidthMm = trimWidthMm + bleed.leftMm + bleed.rightMm;
  const outputHeightMm = trimHeightMm + bleed.topMm + bleed.bottomMm;
  return {
    trimWidthMm,
    trimHeightMm,
    outputWidthMm,
    outputHeightMm,
    orientation: isLandscape ? 'LANDSCAPE' : 'PORTRAIT',
    bleed
  };
}

export function buildCardRenderModel(artboard: Artboard, request: CardExportRequest) {
  const geometry = resolveCardExportGeometry(artboard, request);
  return {
    page: { 
      size: 'CUSTOM', 
      customWidthMm: geometry.outputWidthMm, 
      customHeightMm: geometry.outputHeightMm, 
      orientation: 'PORTRAIT', // Force PORTRAIT to prevent renderer-sdk from swapping width/height
      margins: { top: 0, right: 0, bottom: 0, left: 0 } 
    },
    trimWidthMm: geometry.trimWidthMm,
    trimHeightMm: geometry.trimHeightMm,
    bleedMm: request.includeBleed ? 3 : 0,
    background: request.transparentBackground && request.format === 'PNG' ? 'transparent' : (artboard.background.type === 'SOLID' ? artboard.background.color : 'transparent'),
    elements: artboard.elements.filter(e => e.visible)
  };
}

export function validateExportMemory(request: CardExportRequest, widthMm: number, heightMm: number): string | null {
  if (request.format !== 'PNG' && request.format !== 'JPEG') return null;
  const dpi = request.rasterDpi || 300;
  const widthPx = (widthMm / 25.4) * dpi;
  const heightPx = (heightMm / 25.4) * dpi;
  const bytes = widthPx * heightPx * 4;
  if (bytes > 500 * 1024 * 1024) { // 500MB safety limit per frame
    return `Requested export at ${dpi} DPI exceeds safe memory limits.`;
  }
  return null;
}
