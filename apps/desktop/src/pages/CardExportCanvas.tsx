import React from 'react';

import type { Artboard, DesignElement, DesignTemplate, DesignShadow, DesignLinearGradient, DesignGradientStop, DesignFill, QrDesignElement, PathDesignElement, ImageDesignElement } from '@document-tool/contracts';
import QRCode from 'react-qr-code';
import { geometryToSvgPath, shapeToPathGeometry, resolveRasterImageElementSource, resolveRasterImageFillSource } from '@document-tool/design-engine';

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
  const stops = gradient.stops.map((s: DesignGradientStop) => `${normalizeExportColor(s.color)} ${s.offset}%`).join(', ');
  return `linear-gradient(${gradient.angleDeg ?? 90}deg, ${stops})`;
}

export function artboardFillStyle(fill: DesignFill, assets: DesignTemplate['sharedAssets']): React.CSSProperties {
  if (fill.type === 'NONE') return { backgroundColor: 'transparent' };
  if (fill.type === 'SOLID') return { backgroundColor: normalizeExportColor(fill.color) };
  if (fill.type === 'LINEAR_GRADIENT') return { backgroundImage: normalizeGradient(fill.gradient) };
  if (fill.type === 'RADIAL_GRADIENT') {
    const stops=fill.gradient.stops.map(s=>`${normalizeExportColor(s.color)} ${s.offset}%`).join(', ');
    return {backgroundImage:`radial-gradient(circle at ${fill.gradient.centerXPercent}% ${fill.gradient.centerYPercent}%, ${stops})`};
  }
  if (fill.type === 'PATTERN') {
    const size=Math.max(1,fill.scaleMm??4)*96/25.4,fg=normalizeExportColor(fill.foreground),base=normalizeExportColor(fill.background);
    const image=fill.pattern==='DOTS'?`radial-gradient(${fg} 1px, transparent 1px)`:fill.pattern==='DIAGONAL'?`repeating-linear-gradient(45deg, transparent 0 5px, ${fg} 5px 6px)`:`linear-gradient(${fg} 1px, transparent 1px),linear-gradient(90deg,${fg} 1px,transparent 1px)`;
    return {backgroundColor:base,backgroundImage:image,backgroundSize:`${size}px ${size}px`};
  }
  const source=resolveRasterImageFillSource(fill,assets),alpha=Math.max(0,Math.min(1,fill.opacity??1));
  return source?{backgroundColor:'#ffffff',backgroundImage:`linear-gradient(rgba(255,255,255,${1-alpha}),rgba(255,255,255,${1-alpha})),url("${source}")`,backgroundRepeat:fill.fit==='TILE'?'repeat':'no-repeat',backgroundSize:fill.fit==='FIT'?'100% 100%,contain':fill.fit==='STRETCH'?'100% 100%,100% 100%':fill.fit==='TILE'?`100% 100%,${Math.max(1,fill.tileSizeMm??20)*96/25.4}px`:'100% 100%,cover',backgroundPosition:`center,${fill.positionXPercent??50}% ${fill.positionYPercent??50}%`}:{};
}

function normalizeStroke(stroke: any | undefined, mmToPx: number): string {
  if (!stroke || !stroke.widthMm || stroke.style === 'NONE') return 'none';
  return `${stroke.widthMm * mmToPx}px solid ${normalizeExportColor(stroke.color)}`;
}

export function IsolatedCardExportCanvas({ artboard, assets }: { artboard: Artboard, assets: DesignTemplate['sharedAssets'] }) {
  const MM_TO_CSS_PX = 96 / 25.4;
  
  const canvasStyle: React.CSSProperties = {
    width: `${artboard.widthMm * MM_TO_CSS_PX}px`,
    height: `${artboard.heightMm * MM_TO_CSS_PX}px`,
    ...artboardFillStyle(artboard.background,assets),
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  return (
    <div data-artboard-id={artboard.id} style={canvasStyle}>
      {artboard.border?.enabled&&<div style={{position:'absolute',inset:`${artboard.border.offsetMm*MM_TO_CSS_PX}px`,border:`${artboard.border.widthMm*MM_TO_CSS_PX}px ${artboard.border.style.toLowerCase()} ${artboard.border.color}`,borderRadius:`${artboard.border.radiusMm*MM_TO_CSS_PX}px`,boxSizing:'border-box',zIndex:artboard.watermark?.zOrder==='BEHIND'?1:999999,pointerEvents:'none'}}/>}
      {artboard.watermark?.enabled&&<ArtboardWatermark artboard={artboard} assets={assets}/>}
      {[...artboard.elements].sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id)).filter(e => e.visible && !e.runtimeHidden).map(e => (
        <IsolatedExportElement key={e.id} element={e} assets={assets} mmToPx={MM_TO_CSS_PX} />
      ))}
    </div>
  );
}

function ArtboardWatermark({artboard,assets}:{artboard:Artboard;assets:DesignTemplate['sharedAssets']}){const w=artboard.watermark!;const asset=assets.find(a=>a.id===w.assetId);const content=w.type==='IMAGE'&&asset?<img src={asset.source} style={{width:`${w.scalePercent??35}%`,maxHeight:'80%',objectFit:'contain'}}/>:<span style={{fontSize:`${w.fontSizePt??28}pt`,color:w.color??'#64748b',fontWeight:600}}>{w.text??'DRAFT'}</span>;return <div style={{position:'absolute',inset:0,zIndex:w.zOrder==='BEHIND'?0:999998,pointerEvents:'none',opacity:w.opacity,display:'flex',alignItems:'center',justifyContent:'center',transform:`rotate(${w.rotationDeg}deg)`,overflow:'hidden'}}>{content}</div>}

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
        textShadow: 'shadow' in e ? normalizeShadow((e as any).shadow) : undefined,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {e.text}
      </div>
    );
  } else if (e.type === 'SHAPE') {
    const imagePatternId = `${e.id}-image-fill`;
    const bg = e.fill.type === 'SOLID' 
      ? normalizeExportColor(e.fill.color) 
      : e.fill.type === 'LINEAR_GRADIENT' 
        ? `url(#${e.id}-grad)`
        : e.fill.type === 'IMAGE'
          ? `url(#${imagePatternId})`
        : 'transparent';
    
    const fillOpacity = e.fill.type === 'SOLID' || e.fill.type === 'IMAGE' ? (e.fill.opacity ?? 1) : 1;
    const stroke = e.stroke.style === 'NONE' ? 'none' : normalizeExportColor(e.stroke.color);
    const sw = e.stroke.style === 'NONE' ? 0 : e.stroke.widthMm * mmToPx;
    const dash = e.stroke.style === 'DASHED' ? '6 4' : e.stroke.style === 'DOTTED' ? '2 3' : undefined;
    const shadow = 'shadow' in e ? normalizeShadow((e as any).shadow) : 'none';

    const common = {
      fill: bg,
      fillOpacity,
      stroke,
      strokeWidth: sw,
      strokeDasharray: dash,
      vectorEffect: 'non-scaling-stroke' as const
    };
    let shapeNode: React.ReactNode;
    if (e.shape === 'ROUNDED_RECTANGLE') {
      shapeNode = <rect x="1" y="1" width="98" height="98" rx={Math.min(48, (e.cornerRadiusMm ?? 3) * 4)} ry={Math.min(48, (e.cornerRadiusMm ?? 3) * 4)} {...common} />;
    } else if (e.shape === 'LINE') {
      shapeNode = <line x1="2" y1="50" x2="98" y2="50" {...common} fill="none" />;
    } else {
      const geometry = shapeToPathGeometry(e.shape, { widthMm: 100, heightMm: 100 });
      shapeNode = <path d={geometryToSvgPath(geometry)} {...common} fill={geometry.closed ? bg : 'none'} />;
    }

    const shapeLabel = e.label?.enabled ? e.label : undefined;
    content = (
      <div style={{ position:'relative', width:'100%', height:'100%' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:'absolute', inset:0, filter: shadow !== 'none' ? `drop-shadow(${shadow})` : undefined, overflow: 'visible', transform:`scale(${e.flipX?-1:1},${e.flipY?-1:1})` }}>
          {e.fill.type === 'LINEAR_GRADIENT' && (
            <defs>
              <linearGradient id={`${e.id}-grad`} gradientTransform={`rotate(${e.fill.gradient.angleDeg ?? 90} .5 .5)`}>
                {e.fill.gradient.stops.map((stop: DesignGradientStop, i: number) => (
                  <stop key={i} offset={`${stop.offset}%`} stopColor={normalizeExportColor(stop.color)} stopOpacity={stop.opacity ?? 1} />
                ))}
              </linearGradient>
            </defs>
          )}
          {e.fill.type === 'IMAGE' && <ExportImageFillPattern id={imagePatternId} fill={e.fill} assets={assets} width={100} height={100}/>} 
          {shapeNode}
        </svg>
        {shapeLabel && <div style={{position:'absolute',inset:`${shapeLabel.paddingMm*mmToPx}px`,display:'flex',alignItems:shapeLabel.verticalAlignment==='TOP'?'flex-start':shapeLabel.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:shapeLabel.alignment==='LEFT'?'flex-start':shapeLabel.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',fontFamily:shapeLabel.fontFamily,fontSize:`${shapeLabel.fontSizePt}pt`,fontWeight:shapeLabel.fontWeight,fontStyle:shapeLabel.italic?'italic':'normal',textDecoration:shapeLabel.underline?'underline':'none',color:normalizeExportColor(shapeLabel.color),lineHeight:shapeLabel.lineHeight,textAlign:shapeLabel.alignment.toLowerCase() as any,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{shapeLabel.text}</div>}
      </div>
    );
  } else if (e.type === 'PATH') {
    const pathElement = e as PathDesignElement;
    const gradientId = `export-gradient-${pathElement.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const imagePatternId = `export-image-${pathElement.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const fill = pathElement.fill.type === 'SOLID'
      ? normalizeExportColor(pathElement.fill.color)
      : pathElement.fill.type === 'LINEAR_GRADIENT'
        ? `url(#${gradientId})`
        : pathElement.fill.type === 'IMAGE'
          ? `url(#${imagePatternId})`
        : 'transparent';
    const fillOpacity = pathElement.fill.type === 'SOLID' || pathElement.fill.type === 'IMAGE' ? (pathElement.fill.opacity ?? 1) : 1;
    const stroke = pathElement.stroke.style === 'NONE' ? 'none' : normalizeExportColor(pathElement.stroke.color);
    const strokeWidth = pathElement.stroke.style === 'NONE' ? 0 : pathElement.stroke.widthMm;
    const strokeDasharray = pathElement.stroke.style === 'DASHED'
      ? `${2 / Math.max(mmToPx, 0.001)} ${1.2 / Math.max(mmToPx, 0.001)}`
      : pathElement.stroke.style === 'DOTTED'
        ? `${0.7 / Math.max(mmToPx, 0.001)} ${1 / Math.max(mmToPx, 0.001)}`
        : undefined;
    const d = geometryToSvgPath(pathElement.geometry);
    const widthMm = Math.max(pathElement.size.widthMm, 0.1);
    const heightMm = Math.max(pathElement.size.heightMm, 0.1);
    const shadow = normalizeShadow(pathElement.shadow);
    const pathLabel=pathElement.label?.enabled?pathElement.label:undefined;
    content = (
      <div style={{position:'relative',width:'100%',height:'100%'}}>
        <svg
          data-export-path-id={pathElement.id}
          width="100%"
          height="100%"
          viewBox={`0 0 ${widthMm} ${heightMm}`}
          preserveAspectRatio="none"
          style={{ position:'absolute', inset:0, overflow: 'visible', filter: shadow !== 'none' ? `drop-shadow(${shadow})` : undefined }}
        >
          {pathElement.fill.type === 'LINEAR_GRADIENT' && (
            <defs>
              <linearGradient id={gradientId} gradientTransform={`rotate(${pathElement.fill.gradient.angleDeg ?? 90} .5 .5)`}>
                {pathElement.fill.gradient.stops.map((stop: DesignGradientStop, index: number) => (
                  <stop key={index} offset={`${stop.offset}%`} stopColor={normalizeExportColor(stop.color)} stopOpacity={stop.opacity ?? 1} />
                ))}
              </linearGradient>
            </defs>
          )}
          {pathElement.fill.type === 'IMAGE' && <ExportImageFillPattern id={imagePatternId} fill={pathElement.fill} assets={assets} width={widthMm} height={heightMm}/>} 
          <path
            d={d}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={stroke}
            strokeOpacity={pathElement.stroke.opacity ?? 1}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {pathLabel&&<div style={{position:'absolute',inset:`${pathLabel.paddingMm*mmToPx}px`,display:'flex',alignItems:pathLabel.verticalAlignment==='TOP'?'flex-start':pathLabel.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:pathLabel.alignment==='LEFT'?'flex-start':pathLabel.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',fontFamily:pathLabel.fontFamily,fontSize:`${pathLabel.fontSizePt}pt`,fontWeight:pathLabel.fontWeight,fontStyle:pathLabel.italic?'italic':'normal',textDecoration:pathLabel.underline?'underline':'none',color:normalizeExportColor(pathLabel.color),lineHeight:pathLabel.lineHeight,textAlign:pathLabel.alignment.toLowerCase() as any,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{pathLabel.text}</div>}
      </div>
    );
  } else if (e.type === 'IMAGE') {
    const source = resolveRasterImageElementSource(e, assets);
    if (source) {
      content = (
        <img 
          src={source} 
          alt={e.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: e.fit === 'FIT' ? 'contain' : e.fit === 'FILL' ? 'cover' : 'fill',
            transform: `scale(${geom.flipX ? -1 : 1}, ${geom.flipY ? -1 : 1})`,
            borderRadius: e.cornerRadiusMm ? `${e.cornerRadiusMm * mmToPx}px` : 0,
            border: normalizeStroke(e.stroke, mmToPx),
            boxShadow: 'shadow' in e ? normalizeShadow((e as any).shadow) : undefined,
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
      const shadow = 'shadow' in e ? normalizeShadow((e as any).shadow) : 'none';
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
  } else if (e.type === 'QR') {
      const qr = e as QrDesignElement;
      const value = qr.value || "QR";
      const size = Math.min(geom.widthMm, geom.heightMm) * mmToPx;
      content = (
        <div style={{
          width: '100%', height: '100%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: 'shadow' in e && normalizeShadow((e as any).shadow) !== 'none' ? `drop-shadow(${normalizeShadow((e as any).shadow)})` : undefined
        }}>
          <QRCode 
            value={value} 
            size={size} 
            fgColor={qr.foreground} 
            bgColor={qr.background} 
            level={qr.errorCorrection} 
            style={{height: "auto", maxWidth: "100%", width: "100%"}} 
          />
        </div>
      );
    }

  const hyperlink = e.type === 'IMAGE' ? (e as ImageDesignElement).hyperlink : undefined;

  return (
    <div data-element-id={e.id} style={hyperlink ? { ...shellStyle, pointerEvents: 'auto' } : shellStyle}>
      {hyperlink ? (
        <a href={hyperlink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'auto', cursor: 'pointer' }}>
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function ExportImageFillPattern({id,fill,assets,width,height}:{id:string;fill:Extract<DesignFill,{type:'IMAGE'}>;assets:DesignTemplate['sharedAssets'];width:number;height:number}){
  const source=resolveRasterImageFillSource(fill,assets);
  if(!source)return null;
  const preserveAspectRatio=fill.fit==='FIT'?'xMidYMid meet':fill.fit==='FILL'?'xMidYMid slice':'none';
  return <defs><pattern id={id} patternUnits="userSpaceOnUse" width={width} height={height}><image href={source} x="0" y="0" width={width} height={height} preserveAspectRatio={preserveAspectRatio}/></pattern></defs>;
}
