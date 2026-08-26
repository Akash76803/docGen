import React from 'react';
import type { Artboard, DesignElement, DesignTemplate, DesignShadow, DesignLinearGradient, DesignGradientStop } from '@document-tool/contracts';

export function normalizeExportColor(value: string | undefined | null): string {
  if (!value) return 'transparent';
  if (value.startsWith('var(')) {
    // In an ideal system, we would resolve vars, but export shouldn't contain them.
    // If it does, we strip it to black or transparent.
    return 'transparent';
  }
  if (value.startsWith('color(display-p3')) {
    const match = value.match(/color\(\s*display-p3\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/);
    if (match) {
      const r = Math.max(0, Math.min(255, Math.round(parseFloat(match[1]) * 255)));
      const g = Math.max(0, Math.min(255, Math.round(parseFloat(match[2]) * 255)));
      const b = Math.max(0, Math.min(255, Math.round(parseFloat(match[3]) * 255)));
      const a = match[4] ? parseFloat(match[4]) : 1;
      return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
  return value;
}

function normalizeShadow(shadow?: DesignShadow): string {
  if (!shadow || !shadow.enabled) return 'none';
  const color = normalizeExportColor(shadow.color);
  return `${shadow.offsetXmm}px ${shadow.offsetYmm}px ${shadow.blurMm}px ${color}`;
}

function normalizeGradient(gradient?: DesignLinearGradient): string {
  if (!gradient || gradient.stops.length === 0) return 'none';
  const stops = gradient.stops.map((s: DesignGradientStop) => `${normalizeExportColor(s.color)} ${s.offset * 100}%`).join(', ');
  return `linear-gradient(${gradient.angleDeg ?? 90}deg, ${stops})`;
}

function normalizeStroke(stroke: any | undefined, mmToPx: number): string {
  if (!stroke || !stroke.widthMm || stroke.style === 'NONE') return 'none';
  return `${stroke.widthMm * mmToPx}px solid ${normalizeExportColor(stroke.color)}`;
}

export function IsolatedCardExportCanvas({ artboard, assets }: { artboard: Artboard, assets: DesignTemplate['sharedAssets'] }) {
  const MM_TO_CSS_PX = 96 / 25.4;
  
  const bg = artboard.background.type === 'SOLID' 
    ? normalizeExportColor(artboard.background.color) 
    : artboard.background.type === 'LINEAR_GRADIENT' 
      ? normalizeGradient(artboard.background.gradient) 
      : 'transparent';

  const canvasStyle: React.CSSProperties = {
    width: `${artboard.widthMm * MM_TO_CSS_PX}px`,
    height: `${artboard.heightMm * MM_TO_CSS_PX}px`,
    backgroundColor: artboard.background.type === 'SOLID' ? bg : undefined,
    backgroundImage: artboard.background.type === 'LINEAR_GRADIENT' ? bg : undefined,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  return (
    <div data-artboard-id={artboard.id} style={canvasStyle}>
      {artboard.elements.filter(e => e.visible).map(e => (
        <IsolatedExportElement key={e.id} element={e} assets={assets} mmToPx={MM_TO_CSS_PX} />
      ))}
    </div>
  );
}

export function resolveDesignElementGeometry(e: DesignElement) {
  return {
    xMm: e.position.xMm,
    yMm: e.position.yMm,
    widthMm: e.size.widthMm,
    heightMm: e.size.heightMm,
    rotation: e.rotationDeg,
    flipX: e.type === 'IMAGE' || e.type === 'SVG' ? (e as any).flipX : false,
    flipY: e.type === 'IMAGE' || e.type === 'SVG' ? (e as any).flipY : false,
  };
}

function forceSvgFit(dataUri: string): string {
  if (!dataUri.startsWith('data:image/svg+xml')) return dataUri;
  const isBase64 = dataUri.includes(';base64,');
  const content = dataUri.substring(dataUri.indexOf(',') + 1);
  if (!content) return dataUri;
  try {
    let svg = isBase64 ? atob(content) : decodeURIComponent(content);
    svg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs) => {
      const clean = String(attrs).replace(/\s(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
      return `<svg${clean} width="100%" height="100%">`;
    });
    return `data:image/svg+xml;${isBase64 ? 'base64,' + btoa(svg) : 'utf8,' + encodeURIComponent(svg)}`;
  } catch (e) {
    return dataUri;
  }
}

function IsolatedExportElement({ element, assets, mmToPx }: { element: DesignElement, assets: DesignTemplate['sharedAssets'], mmToPx: number }) {
  const e = element;
  const geom = resolveDesignElementGeometry(e);
  
  const shellStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${geom.xMm * mmToPx}px`,
    top: `${geom.yMm * mmToPx}px`,
    width: `${geom.widthMm * mmToPx}px`,
    height: `${geom.heightMm * mmToPx}px`,
    transform: `rotate(${geom.rotation}deg)`,
    opacity: e.opacity,
    zIndex: e.zIndex,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  };

  let content: React.ReactNode = null;

  if (e.type === 'TEXT') {
    content = (
      <div style={{
        fontFamily: e.style.fontFamily,
        fontSize: `${e.style.fontSizePt}pt`,
        fontWeight: e.style.fontWeight,
        fontStyle: e.style.italic ? 'italic' : 'normal',
        textDecoration: e.style.underline ? 'underline' : 'none',
        color: normalizeExportColor(e.style.color),
        textAlign: e.style.alignment.toLowerCase() as any,
        lineHeight: e.style.lineHeight,
        letterSpacing: `${e.style.letterSpacingPt}pt`,
        textShadow: normalizeShadow(e.shadow),
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {e.text}
      </div>
    );
  } else if (e.type === 'SHAPE') {
    const bg = e.fill.type === 'SOLID' 
      ? normalizeExportColor(e.fill.color) 
      : e.fill.type === 'LINEAR_GRADIENT' 
        ? `url(#${e.id}-grad)`
        : 'transparent';
    
    const fillOpacity = e.fill.type === 'SOLID' ? (e.fill.opacity ?? 1) : 1;
    const stroke = e.stroke.style === 'NONE' ? 'none' : normalizeExportColor(e.stroke.color);
    const sw = e.stroke.style === 'NONE' ? 0 : e.stroke.widthMm * mmToPx;
    const dash = e.stroke.style === 'DASHED' ? '6 4' : e.stroke.style === 'DOTTED' ? '2 3' : undefined;
    const shadow = normalizeShadow(e.shadow);

    const common = {
      fill: bg,
      fillOpacity,
      stroke,
      strokeWidth: sw,
      strokeDasharray: dash,
      vectorEffect: 'non-scaling-stroke' as const
    };

    let shapeNode = null;
    switch(e.shape) {
      case 'RECTANGLE': shapeNode = <rect x="1" y="1" width="98" height="98" {...common} />; break;
      case 'ROUNDED_RECTANGLE': shapeNode = <rect x="1" y="1" width="98" height="98" rx={Math.min(48, (e.cornerRadiusMm ?? 3) * 4)} ry={Math.min(48, (e.cornerRadiusMm ?? 3) * 4)} {...common} />; break;
      case 'CIRCLE':
      case 'ELLIPSE': shapeNode = <ellipse cx="50" cy="50" rx="48" ry="48" {...common} />; break;
      case 'LINE': shapeNode = <line x1="2" y1="50" x2="98" y2="50" {...common} fill="none" />; break;
      case 'TRIANGLE': shapeNode = <polygon points="50,2 98,98 2,98" {...common} />; break;
      case 'ARROW': shapeNode = <polygon points="2,35 62,35 62,15 98,50 62,85 62,65 2,65" {...common} />; break;
      case 'STAR': shapeNode = <polygon points="50,2 61,36 97,36 68,57 79,92 50,71 21,92 32,57 3,36 39,36" {...common} />; break;
      case 'POLYGON': shapeNode = <polygon points="25,3 75,3 98,50 75,97 25,97 2,50" {...common} />; break;
      case 'RIBBON': shapeNode = <polygon points="2,20 20,20 20,8 80,8 80,20 98,20 88,50 98,80 80,80 80,92 20,92 20,80 2,80 12,50" {...common} />; break;
      case 'BADGE': shapeNode = <polygon points="50,2 62,14 79,9 86,25 97,37 88,52 92,69 76,77 67,94 50,87 33,94 24,77 8,69 12,52 3,37 14,25 21,9 38,14" {...common} />; break;
    }

    content = (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: shadow !== 'none' ? `drop-shadow(${shadow})` : undefined, overflow: 'visible' }}>
        {e.fill.type === 'LINEAR_GRADIENT' && (
          <defs>
            <linearGradient id={`${e.id}-grad`} gradientTransform={`rotate(${e.fill.gradient.angleDeg ?? 90} .5 .5)`}>
              {e.fill.gradient.stops.map((stop: DesignGradientStop, i: number) => (
                <stop key={i} offset={`${stop.offset * 100}%`} stopColor={normalizeExportColor(stop.color)} stopOpacity={stop.opacity ?? 1} />
              ))}
            </linearGradient>
          </defs>
        )}
        {shapeNode}
      </svg>
    );
  } else if (e.type === 'IMAGE') {
    const asset = assets.find(a => a.id === e.assetId);
    if (asset && asset.source) {
      content = (
        <img 
          src={asset.source} 
          alt={e.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: e.fit === 'FIT' ? 'contain' : e.fit === 'FILL' ? 'cover' : 'fill',
            transform: `scale(${geom.flipX ? -1 : 1}, ${geom.flipY ? -1 : 1})`,
            borderRadius: e.cornerRadiusMm ? `${e.cornerRadiusMm * mmToPx}px` : 0,
            border: normalizeStroke(e.stroke, mmToPx),
            boxShadow: normalizeShadow(e.shadow),
            boxSizing: 'border-box'
          }} 
        />
      );
    }
  } else if (e.type === 'SVG') {
    const asset = assets.find(a => a.id === e.assetId);
    if (asset && asset.source) {
      const tinted = asset.metadata?.recolorable === true && e.tintColor;
      const border = normalizeStroke(e.stroke, mmToPx);
      const shadow = normalizeShadow(e.shadow);
      let inlineSvg = '';
      if (asset.source.startsWith('data:image/svg+xml')) {
        const isBase64 = asset.source.includes(';base64,');
        const contentStr = asset.source.substring(asset.source.indexOf(',') + 1);
        if (contentStr) {
          try {
            let svg = isBase64 ? atob(contentStr) : decodeURIComponent(contentStr);
            // Replace width/height with 100%
            svg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs) => {
              const clean = String(attrs).replace(/\s(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
              return `<svg${clean} width="100%" height="100%">`;
            });
            // Normalize colors
            if (tinted && e.tintColor) {
               const tc = normalizeExportColor(e.tintColor);
               // Replace all fill/stroke except none with tintColor
               svg = svg.replace(/\s(fill|stroke)\s*=\s*(?:"[^"]*"|'[^']*')/gi, (m, attr) => {
                 if (m.includes('none')) return m;
                 return ` ${attr}="${tc}"`;
               });
               svg = svg.replace(/<svg\b/i, `<svg fill="${tc}" color="${tc}" `);
            } else {
               // Replace currentColor and var(--...) with #000 or their resolved values if possible, 
               // but since we don't have CSS context, we just strip color() and var() functions
               svg = svg.replace(/\s(fill|stroke|color|stop-color)\s*=\s*["']([^"']+)["']/gi, (m, attr, val) => {
                 if (val.includes('var(') || val === 'currentColor') return ` ${attr}="#000000"`;
                 if (val.includes('color(')) return ` ${attr}="${normalizeExportColor(val)}"`;
                 return m;
               });
            }
            inlineSvg = svg;
          } catch (err) {
            // fallback
          }
        }
      }

      const style: React.CSSProperties = {
        width: '100%', height: '100%', 
        border,
        filter: shadow !== 'none' ? `drop-shadow(${shadow})` : undefined,
        transform: `scale(${geom.flipX ? -1 : 1}, ${geom.flipY ? -1 : 1})`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };

      if (inlineSvg) {
        content = <div style={style} dangerouslySetInnerHTML={{ __html: inlineSvg }} />;
      } else if (tinted) {
        content = (
          <div style={{
            ...style,
            backgroundColor: normalizeExportColor(e.tintColor),
            maskImage: `url("${forceSvgFit(asset.source)}")`,
            WebkitMaskImage: `url("${forceSvgFit(asset.source)}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }} />
        );
      } else {
        content = (
          <img 
            src={forceSvgFit(asset.source)} 
            alt={e.name} 
            style={{ ...style, objectFit: 'contain' }} 
          />
        );
      }
    }
  }

  return (
    <div data-element-id={e.id} style={shellStyle}>
      {content}
    </div>
  );
}
