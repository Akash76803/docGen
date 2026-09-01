import React from 'react';

import type { Artboard, DesignElement, DesignTemplate, DesignShadow, DesignFill, DesignStroke, QrDesignElement, PathDesignElement } from '@document-tool/contracts';
import QRCode from 'react-qr-code';
import { geometryToSvgPath, shapeToPathGeometry, resolveRasterImageElementSource, resolveRasterImageFillSource, normalizeImageFillTransform, normalizeStrokeDashArray } from '@document-tool/design-engine';

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


function normalizeStroke(stroke: DesignStroke | undefined, mmToPx: number): string {
  if (!stroke || !stroke.widthMm || stroke.style === 'NONE') return 'none';
  const style=stroke.style==='DOTTED'?'dotted':stroke.style==='DASHED'||stroke.style==='CUSTOM'?'dashed':'solid';
  return `${stroke.widthMm * mmToPx}px ${style} ${normalizeExportColor(stroke.color)}`;
}

export function IsolatedCardExportCanvas({ artboard, assets }: { artboard: Artboard, assets: DesignTemplate['sharedAssets'] }) {
  const MM_TO_CSS_PX = 96 / 25.4;
  const clean=artboard.id.replace(/[^a-zA-Z0-9_-]/g,'');
  const ids={linear:`export-artboard-gradient-${clean}`,radial:`export-artboard-radial-${clean}`,pattern:`export-artboard-pattern-${clean}`,image:`export-artboard-image-${clean}`};
  const backgroundPaint=exportVectorFillPaint(artboard.background,ids);
  const backgroundOpacity=exportVectorFillOpacity(artboard.background);

  const canvasStyle: React.CSSProperties = {
    width: `${artboard.widthMm * MM_TO_CSS_PX}px`,
    height: `${artboard.heightMm * MM_TO_CSS_PX}px`,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  return (
    <div data-artboard-id={artboard.id} style={canvasStyle}>
      <svg data-export-artboard-background width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none" style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none'}}>
        <ExportVectorFillDefs fill={artboard.background} ids={ids} assets={assets} width={artboard.widthMm} height={artboard.heightMm}/>
        <rect x="0" y="0" width={artboard.widthMm} height={artboard.heightMm} fill={backgroundPaint} fillOpacity={backgroundOpacity}/>
      </svg>
      {[...artboard.elements].sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id)).filter(e => e.visible && !e.runtimeHidden).map(e => (
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
    zIndex: e.zIndex + 1,
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
    const clean=e.id.replace(/[^a-zA-Z0-9_-]/g,'');
    const ids={linear:`export-linear-${clean}`,radial:`export-radial-${clean}`,pattern:`export-pattern-${clean}`,image:`export-image-${clean}`};
    const fill=exportVectorFillPaint(e.fill,ids),fillOpacity=exportVectorFillOpacity(e.fill),strokeProps=exportVectorStrokeProps(e.stroke,mmToPx);
    const sw=e.stroke.style==='NONE'?0:e.stroke.widthMm*mmToPx;
    const shadow='shadow' in e?normalizeShadow((e as any).shadow):'none';
    const common={fill,fillOpacity,strokeWidth:sw,...strokeProps,vectorEffect:'non-scaling-stroke' as const};
    let shapeNode:React.ReactNode;
    if(e.shape==='ROUNDED_RECTANGLE')shapeNode=<rect x="1" y="1" width="98" height="98" rx={Math.min(48,(e.cornerRadiusMm??3)*4)} ry={Math.min(48,(e.cornerRadiusMm??3)*4)} {...common}/>;
    else if(e.shape==='LINE')shapeNode=<line x1="2" y1="50" x2="98" y2="50" {...common} fill="none"/>;
    else {const geometry=shapeToPathGeometry(e.shape,{widthMm:100,heightMm:100});shapeNode=<path d={geometryToSvgPath(geometry)} {...common} fill={geometry.closed?fill:'none'}/>;}
    const shapeLabel=e.label?.enabled?e.label:undefined;
    content=(<div style={{position:'relative',width:'100%',height:'100%'}}><svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute',inset:0,filter:shadow!=='none'?`drop-shadow(${shadow})`:undefined,overflow:'visible',transform:`scale(${e.flipX?-1:1},${e.flipY?-1:1})`}}><ExportVectorFillDefs fill={e.fill} ids={ids} assets={assets} width={100} height={100}/>{shapeNode}</svg>{shapeLabel&&<div style={{position:'absolute',inset:`${shapeLabel.paddingMm*mmToPx}px`,display:'flex',alignItems:shapeLabel.verticalAlignment==='TOP'?'flex-start':shapeLabel.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:shapeLabel.alignment==='LEFT'?'flex-start':shapeLabel.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',fontFamily:shapeLabel.fontFamily,fontSize:`${shapeLabel.fontSizePt}pt`,fontWeight:shapeLabel.fontWeight,fontStyle:shapeLabel.italic?'italic':'normal',textDecoration:shapeLabel.underline?'underline':'none',color:normalizeExportColor(shapeLabel.color),lineHeight:shapeLabel.lineHeight,textAlign:shapeLabel.alignment.toLowerCase() as any,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{shapeLabel.text}</div>}</div>);
  } else if (e.type === 'PATH') {
    const pathElement=e as PathDesignElement,clean=pathElement.id.replace(/[^a-zA-Z0-9_-]/g,'');
    const ids={linear:`export-linear-${clean}`,radial:`export-radial-${clean}`,pattern:`export-pattern-${clean}`,image:`export-image-${clean}`};
    const fill=exportVectorFillPaint(pathElement.fill,ids),fillOpacity=exportVectorFillOpacity(pathElement.fill),strokeProps=exportVectorStrokeProps(pathElement.stroke,1);
    const widthMm=Math.max(pathElement.size.widthMm,.1),heightMm=Math.max(pathElement.size.heightMm,.1),shadow=normalizeShadow(pathElement.shadow),pathLabel=pathElement.label?.enabled?pathElement.label:undefined;
    content=(<div style={{position:'relative',width:'100%',height:'100%'}}><svg data-export-path-id={pathElement.id} width="100%" height="100%" viewBox={`0 0 ${widthMm} ${heightMm}`} preserveAspectRatio="none" style={{position:'absolute',inset:0,overflow:'visible',filter:shadow!=='none'?`drop-shadow(${shadow})`:undefined}}><ExportVectorFillDefs fill={pathElement.fill} ids={ids} assets={assets} width={widthMm} height={heightMm}/><path d={geometryToSvgPath(pathElement.geometry)} fill={fill} fillOpacity={fillOpacity} strokeWidth={pathElement.stroke.style==='NONE'?0:pathElement.stroke.widthMm} {...strokeProps} vectorEffect="non-scaling-stroke"/></svg>{pathLabel&&<div style={{position:'absolute',inset:`${pathLabel.paddingMm*mmToPx}px`,display:'flex',alignItems:pathLabel.verticalAlignment==='TOP'?'flex-start':pathLabel.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:pathLabel.alignment==='LEFT'?'flex-start':pathLabel.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',fontFamily:pathLabel.fontFamily,fontSize:`${pathLabel.fontSizePt}pt`,fontWeight:pathLabel.fontWeight,fontStyle:pathLabel.italic?'italic':'normal',textDecoration:pathLabel.underline?'underline':'none',color:normalizeExportColor(pathLabel.color),lineHeight:pathLabel.lineHeight,textAlign:pathLabel.alignment.toLowerCase() as any,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{pathLabel.text}</div>}</div>);
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

  return (
    <div data-element-id={e.id} style={shellStyle}>
      {content}
    </div>
  );
}

function exportVectorFillPaint(fill:DesignFill,ids:{linear:string;radial:string;pattern:string;image:string}){
 if(fill.type==='SOLID')return normalizeExportColor(fill.color);
 if(fill.type==='LINEAR_GRADIENT')return `url(#${ids.linear})`;
 if(fill.type==='RADIAL_GRADIENT')return `url(#${ids.radial})`;
 if(fill.type==='PATTERN')return `url(#${ids.pattern})`;
 if(fill.type==='IMAGE')return `url(#${ids.image})`;
 return 'transparent';
}
function exportVectorFillOpacity(fill:DesignFill){return fill.type==='SOLID'||fill.type==='IMAGE'?(fill.opacity??1):1;}
function exportVectorStrokeProps(stroke:DesignStroke,unitScale:number){
 const dash=normalizeStrokeDashArray(stroke)?.map(value=>value*unitScale).join(' ');
 return {stroke:stroke.style==='NONE'?'none':normalizeExportColor(stroke.color),strokeOpacity:stroke.opacity??1,strokeDasharray:dash,strokeDashoffset:(stroke.dashOffset??0)*unitScale,strokeLinecap:(stroke.lineCap??'BUTT').toLowerCase() as 'butt'|'round'|'square',strokeLinejoin:(stroke.lineJoin??'MITER').toLowerCase() as 'miter'|'round'|'bevel',strokeMiterlimit:stroke.miterLimit??4};
}
function ExportPatternFillDef({id,fill}:{id:string;fill:Extract<DesignFill,{type:'PATTERN'}>}){
 const p=fill.pattern,size=Math.max(.025,.12*p.scale),opacity=p.opacity??1;
 return <pattern id={id} patternUnits="objectBoundingBox" width={size} height={size} viewBox="0 0 10 10" preserveAspectRatio="none" patternTransform={`rotate(${p.rotationDeg})`}><rect x="0" y="0" width="10" height="10" fill={normalizeExportColor(p.background)}/>{p.kind==='HATCH'&&<path d="M 0 10 L 10 0" stroke={normalizeExportColor(p.foreground)} strokeOpacity={opacity} strokeWidth="0.8"/>}{p.kind==='DOT'&&<circle cx="5" cy="5" r="1.6" fill={normalizeExportColor(p.foreground)} fillOpacity={opacity}/>} {p.kind==='CHECKER'&&<><rect x="0" y="0" width="5" height="5" fill={normalizeExportColor(p.foreground)} fillOpacity={opacity}/><rect x="5" y="5" width="5" height="5" fill={normalizeExportColor(p.foreground)} fillOpacity={opacity}/></>}</pattern>;
}
function ExportVectorFillDefs({fill,ids,assets,width,height}:{fill:DesignFill;ids:{linear:string;radial:string;pattern:string;image:string};assets:DesignTemplate['sharedAssets'];width:number;height:number}){
 return <defs>{fill.type==='LINEAR_GRADIENT'&&<linearGradient id={ids.linear} gradientTransform={`rotate(${fill.gradient.angleDeg} .5 .5)`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={normalizeExportColor(stop.color)} stopOpacity={stop.opacity??1}/>)}</linearGradient>}{fill.type==='RADIAL_GRADIENT'&&<radialGradient id={ids.radial} cx={`${fill.gradient.centerX}%`} cy={`${fill.gradient.centerY}%`} r={`${fill.gradient.radius}%`} fx={`${fill.gradient.focalX??fill.gradient.centerX}%`} fy={`${fill.gradient.focalY??fill.gradient.centerY}%`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={normalizeExportColor(stop.color)} stopOpacity={stop.opacity??1}/>)}</radialGradient>}{fill.type==='PATTERN'&&<ExportPatternFillDef id={ids.pattern} fill={fill}/>} {fill.type==='IMAGE'&&<ExportImageFillPattern id={ids.image} fill={fill} assets={assets} width={width} height={height}/>}</defs>;
}
function ExportImageFillPattern({id,fill,assets,width,height}:{id:string;fill:Extract<DesignFill,{type:'IMAGE'}>;assets:DesignTemplate['sharedAssets'];width:number;height:number}){
  const source=resolveRasterImageFillSource(fill,assets);if(!source)return null;
  const preserveAspectRatio=fill.fit==='FIT'?'xMidYMid meet':fill.fit==='FILL'?'xMidYMid slice':'none';
  const t=normalizeImageFillTransform(fill.transform),cx=width/2,cy=height/2,dx=t.offsetX/100*width,dy=t.offsetY/100*height;
  const transform=`translate(${cx+dx} ${cy+dy}) rotate(${t.rotationDeg}) scale(${t.scale}) translate(${-cx} ${-cy})`;
  return <pattern id={id} patternUnits="userSpaceOnUse" width={width} height={height}><image href={source} x="0" y="0" width={width} height={height} preserveAspectRatio={preserveAspectRatio} transform={transform}/></pattern>;
}

