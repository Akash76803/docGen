import React from 'react';
import type { Artboard, DesignElement, DesignTemplate, TextDesignElement, ImageDesignElement, SvgDesignElement, ShapeDesignElement, PathDesignElement, PathGeometry } from '@document-tool/contracts';
import { 
  updateDesignElement,
  alignElements,
  distributeElements,
  joinPathGeometries,
  shapeToPathGeometry,
  trimPathSegment,
  closePathGeometry,
  getPathEndpoints,
  performElementBooleanOperation,
  replaceElementsAtLayer,
  lineToCurve, lineToArc, flipArc, mirrorElementsAcrossArtboard
} from '@document-tool/design-engine';
import { DesignerToolbarMode } from './designerToolbarConfig.js';
import { AlignLeft, AlignCenter, AlignRight, AlignHorizontalSpaceAround, AlignVerticalSpaceAround } from 'lucide-react';

export type DesignerContextToolbarProps = {
  mode: DesignerToolbarMode;
  sourceArtboard: Artboard;
  sourceElements: DesignElement[];
  mutate: (fn: (t: DesignTemplate) => DesignTemplate) => void;
  onGroupSelected?: () => void;
  onUngroupSelected?: () => void;
  pathEditMode?: { active: boolean; selectedNodeIds: string[] };
  interactionMode?: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE';
  setInteractionMode?: (m: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE') => void;
  pathSelectedSegmentIds?: string[];
  setPathSelectedSegmentIds?: (m: string[]) => void;
  onMirrorInvoked?: (axis: 'HORIZONTAL'|'VERTICAL') => void;
};

export const DesignerContextToolbar: React.FC<DesignerContextToolbarProps> = ({
  mode, sourceArtboard, sourceElements, mutate, onGroupSelected, onUngroupSelected, pathEditMode, interactionMode, setInteractionMode, pathSelectedSegmentIds, setPathSelectedSegmentIds, onMirrorInvoked
}) => {
  if (mode === 'NONE') return null;

  const artboardId = sourceArtboard.id;
  const primary = sourceElements[0];

  const update = (fn: (e: DesignElement) => DesignElement) => {
    if (primary) mutate(t => updateDesignElement(t, artboardId, primary.id, fn));
  };

  const renderTextToolbar = () => {
    const el = primary as TextDesignElement;
    if (!el) return null;
    return (
      <>
        <div className="dg-designer-context-toolbar__group">
          <select value={el.style.fontFamily} onChange={e => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, fontFamily: e.target.value } }))}>
            {['Arial','Helvetica','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New'].map(f=><option key={f}>{f}</option>)}
          </select>
          <input 
            type="number" 
            className="dg-toolbar-number"
            min="1" 
            value={el.style.fontSizePt} 
            onChange={e => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, fontSizePt: Math.max(1, Number(e.target.value) || 1) } }))}
          />
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <button className={`dg-toolbar-toggle ${el.style.fontWeight >= 700 ? 'active' : ''}`} onClick={() => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, fontWeight: el.style.fontWeight >= 700 ? 400 : 700 } }))}>B</button>
          <button className={`dg-toolbar-toggle ${el.style.italic ? 'active' : ''}`} onClick={() => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, italic: !el.style.italic } }))} style={{fontStyle:'italic'}}>I</button>
          <button className={`dg-toolbar-toggle ${el.style.underline ? 'active' : ''}`} onClick={() => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, underline: !el.style.underline } }))} style={{textDecoration:'underline'}}>U</button>
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <select value={el.style.alignment} onChange={e => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, alignment: e.target.value as any } }))}>
            <option value="LEFT">Left</option>
            <option value="CENTER">Center</option>
            <option value="RIGHT">Right</option>
          </select>
          <input type="color" value={el.style.color} onChange={e => update(e_ => ({ ...e_, style: { ... (e_ as TextDesignElement).style, color: e.target.value } }))} />
        </div>
      </>
    );
  };

  const renderImageToolbar = () => {
    const el = primary as ImageDesignElement;
    if (!el) return null;
    return (
      <>
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Fit:</span>
          <select value={el.fit} onChange={e => update(e_ => ({ ...e_, fit: e.target.value as any }))}>
            <option value="FIT">Fit</option>
            <option value="FILL">Fill</option>
            <option value="STRETCH">Stretch</option>
          </select>
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Opacity:</span>
          <input type="range" min="0" max="100" value={Math.round(el.opacity * 100)} onChange={e => update(e_ => ({ ...e_, opacity: Number(e.target.value) / 100 }))} />
        </div>
      </>
    );
  };

  const renderSvgToolbar = () => {
    const el = primary as SvgDesignElement;
    if (!el) return null;
    return (
      <>
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Tint:</span>
          <input type="color" value={el.tintColor ?? '#111827'} onChange={e => update(e_ => ({ ...e_, tintColor: e.target.value }))} />
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Opacity:</span>
          <input type="range" min="0" max="100" value={Math.round(el.opacity * 100)} onChange={e => update(e_ => ({ ...e_, opacity: Number(e.target.value) / 100 }))} />
        </div>
      </>
    );
  };

  const renderShapeToolbar = () => {
    const el = primary as ShapeDesignElement;
    if (!el) return null;
    const isSolid = el.fill.type === 'SOLID';
    return (
      <>
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Fill:</span>
          {isSolid && <input type="color" value={(el.fill as any).color} onChange={e => update(e_ => ({ ...e_, fill: { type: 'SOLID', color: e.target.value, opacity: 1 } }))} />}
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <span className="dg-designer-context-toolbar__label">Stroke:</span>
          <input type="color" value={el.stroke.color} onChange={e => update(e_ => ({ ...e_, stroke: { ... (e_ as ShapeDesignElement).stroke, color: e.target.value } }))} />
          <input type="number" min="0" step="0.1" className="dg-toolbar-number" value={el.stroke.widthMm} onChange={e => update(e_ => ({ ...e_, stroke: { ... (e_ as ShapeDesignElement).stroke, widthMm: Math.max(0, Number(e.target.value) || 0) } }))} />
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <button className="dg-toolbar-button" onClick={() => {
            mutate(t => {
              return {
                ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
                  ...a, elements: a.elements.map(e => {
                    if (e.id !== el.id) return e;
                    const pathGeo = shapeToPathGeometry(el.shape as any, el.size);
                    return {
                      ...e,
                      type: 'PATH',
                      geometry: pathGeo,
                    } as unknown as import('@document-tool/contracts').PathDesignElement;
                  })
                } : a)
              };
            });
            if (setInteractionMode) setInteractionMode('EDIT_PATH');
          }}>Convert to Path</button>
        </div>
      </>
    );
  };

  const renderMultiToolbar = () => {
    const ids = sourceElements.map(e => e.id);
    const unitCount = sourceElements.length;
    
    // Check if exactly 2 PATHs are selected and open
    const paths = sourceElements.filter(e => e.type === 'PATH') as import('@document-tool/contracts').PathDesignElement[];
    const canJoinPaths = paths.length === 2 && !paths[0]!.geometry.closed && !paths[1]!.geometry.closed;
    const canBooleanPaths = paths.length === 2;
    
    const doBooleanOperation = (op: 'UNION' | 'SUBTRACT' | 'INTERSECT' | 'EXCLUDE') => {
       if (!canBooleanPaths) return;
       // Deterministic rule: bottom/first selected = base A, top/second selected = cutter B
       // `sourceElements` is derived from `selection.elementIds` or `artboard.elements` order?
       // Let's assume `sourceElements` is ordered by selection time or z-index.
       // The user said: bottom/first selected = base A.
       const elA = paths[0]!;
       const elB = paths[1]!;
       mutate(t => replaceElementsAtLayer(t,sourceArtboard.id,[elA.id,elB.id],[{...performElementBooleanOperation(elA,elB,op),zIndex:Math.max(elA.zIndex,elB.zIndex)}]));
       // Optional: update selection to the new element
    };
    
    const doJoinPaths = () => {
       if (!canJoinPaths) return;
       mutate(t => {
          const joined=joinPathGeometries(paths[0]!.geometry,paths[1]!.geometry,paths[0],paths[1]);
          return replaceElementsAtLayer(t,sourceArtboard.id,[paths[0]!.id,paths[1]!.id],[{
                   ...paths[0]!,
                   id: crypto.randomUUID(),
                   zIndex:Math.max(paths[0]!.zIndex,paths[1]!.zIndex),
                   ...joined.boundingBox,
                   geometry:joined.geometry
                }]);
       });
    };
    
    return (
      <>
        <div className="dg-designer-context-toolbar__group">
          <button className="dg-toolbar-button" title="Align Left" onClick={() => mutate(t => alignElements(t, artboardId, ids, 'LEFT', 'SELECTION'))}><AlignLeft size={16}/></button>
          <button className="dg-toolbar-button" title="Align Center" onClick={() => mutate(t => alignElements(t, artboardId, ids, 'HCENTER', 'SELECTION'))}><AlignCenter size={16}/></button>
          <button className="dg-toolbar-button" title="Align Right" onClick={() => mutate(t => alignElements(t, artboardId, ids, 'RIGHT', 'SELECTION'))}><AlignRight size={16}/></button>
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          <button className="dg-toolbar-button" title="Distribute Horizontal" disabled={unitCount < 3} onClick={() => mutate(t => distributeElements(t, artboardId, ids, 'HORIZONTAL'))}><AlignHorizontalSpaceAround size={16}/></button>
          <button className="dg-toolbar-button" title="Distribute Vertical" disabled={unitCount < 3} onClick={() => mutate(t => distributeElements(t, artboardId, ids, 'VERTICAL'))}><AlignVerticalSpaceAround size={16}/></button>
        </div>
        <div className="dg-designer-context-toolbar__separator" />
        <div className="dg-designer-context-toolbar__group">
          {onGroupSelected && <button className="dg-toolbar-button" onClick={onGroupSelected} disabled={unitCount < 2}>Group</button>}
          {onUngroupSelected && <button className="dg-toolbar-button" onClick={onUngroupSelected}>Ungroup</button>}
        </div>
        {canBooleanPaths && (
          <>
            <div className="dg-designer-context-toolbar__separator" />
            <div className="dg-designer-context-toolbar__group">
              <button className="dg-toolbar-button" title="Boolean Union" onClick={() => doBooleanOperation('UNION')}>Union</button>
              <button className="dg-toolbar-button" title="Boolean Subtract" onClick={() => doBooleanOperation('SUBTRACT')}>Subtract</button>
              <button className="dg-toolbar-button" title="Boolean Intersect" onClick={() => doBooleanOperation('INTERSECT')}>Intersect</button>
              <button className="dg-toolbar-button" title="Boolean Exclude" onClick={() => doBooleanOperation('EXCLUDE')}>Exclude</button>
            </div>
          </>
        )}
        {canJoinPaths && (
          <>
            <div className="dg-designer-context-toolbar__separator" />
            <div className="dg-designer-context-toolbar__group">
              <button className="dg-toolbar-button" onClick={doJoinPaths}>Join Paths</button>
            </div>
          </>
        )}
      </>
    );
  };

  const renderArtboardToolbar = () => {
    return (
      <div className="dg-designer-context-toolbar__group">
        <span className="dg-designer-context-toolbar__label">{sourceArtboard.name}</span>
      </div>
    );
  };

  const renderPathToolbar = () => {
    const el = primary as PathDesignElement;
    if (!el) return null;
    const isEditing = pathEditMode?.active;
    const selectedNodes = isEditing && pathEditMode?.selectedNodeIds.length ? pathEditMode.selectedNodeIds : [];
    
    const setNodeMode = (nodeMode: 'CORNER'|'SMOOTH'|'SYMMETRIC') => {
      mutate(t => {
        return {
          ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
            ...a, elements: a.elements.map(e => {
              if (e.id !== el.id) return e;
              const pEl = e as PathDesignElement;
              return { ...pEl, geometry: { ...pEl.geometry, points: pEl.geometry.points.map(pt => {
                if (selectedNodes.includes(pt.id)) {
                  let inH = pt.inHandle;
                  let outH = pt.outHandle;
                  if (nodeMode === 'CORNER') {
                    // Keep handles but decouple
                  } else if (nodeMode === 'SMOOTH' || nodeMode === 'SYMMETRIC') {
                    // If no handles, generate them
                    if (!inH && !outH) {
                      inH = { x: pt.x - 5, y: pt.y };
                      outH = { x: pt.x + 5, y: pt.y };
                    } else if (inH && !outH) {
                      outH = { x: pt.x + (pt.x - inH.x), y: pt.y + (pt.y - inH.y) };
                    } else if (outH && !inH) {
                      inH = { x: pt.x + (pt.x - outH.x), y: pt.y + (pt.y - outH.y) };
                    } else if (inH && outH) {
                       // align them
                       if (nodeMode === 'SYMMETRIC') {
                          outH = { x: pt.x + (pt.x - inH.x), y: pt.y + (pt.y - inH.y) };
                       } else {
                          const distOut = Math.hypot(outH.x - pt.x, outH.y - pt.y);
                          const dx = pt.x - inH.x; const dy = pt.y - inH.y;
                          const distIn = Math.hypot(dx, dy) || 1;
                          outH = { x: pt.x + (dx/distIn)*distOut, y: pt.y + (dy/distIn)*distOut };
                       }
                    }
                  }
                  return { ...pt, mode: nodeMode, inHandle: inH, outHandle: outH };
                }
                return pt;
              })}};
            })
          } : a)
        };
      });
    };

    const convertSegment = (toType: 'LINE' | 'CUBIC_BEZIER') => {
      mutate(t => {
        return {
          ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
            ...a, elements: a.elements.map(e => {
              if (e.id !== el.id) return e;
              const pEl = e as PathDesignElement;
              return { ...pEl, geometry: { ...pEl.geometry, segments: pEl.geometry.segments.map(seg => {
                if (pathSelectedSegmentIds?.includes(seg.id as string)) {
                   return { ...seg, type: toType };
                }
                return seg;
              })}};
            })
          } : a)
        };
      });
    };

    const trimSegment = () => {
      const segId = pathSelectedSegmentIds?.[0];
      if (!segId) return;
      mutate(t => {
        return {
          ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
            ...a, elements: a.elements.map(e => {
              if (e.id !== el.id) return e;
              const pEl = e as PathDesignElement;
              return { ...pEl, geometry: trimPathSegment(pEl.geometry, segId) };
            })
          } : a)
        };
      });
      if (setPathSelectedSegmentIds) setPathSelectedSegmentIds([]);
    };
    
    const applyToSelectedSegment = (fn: (geo: PathGeometry, segId: string) => PathGeometry) => {
      const segId = pathSelectedSegmentIds?.[0];
      if (!segId) return;
      mutate(t => {
        return {
          ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
            ...a, elements: a.elements.map(e => {
              if (e.id !== el.id) return e;
              const pEl = e as PathDesignElement;
              return { ...pEl, geometry: fn(pEl.geometry, segId) };
            })
          } : a)
        };
      });
    };

    const closePath = () => {
      mutate(t => {
        return {
          ...t, artboards: t.artboards.map(a => a.id === sourceArtboard.id ? {
            ...a, elements: a.elements.map(e => {
              if (e.id !== el.id) return e;
              const pEl = e as PathDesignElement;
              return { ...pEl, geometry: closePathGeometry(pEl.geometry) };
            })
          } : a)
        };
      });
    };

    return (
      <>
        {isEditing && selectedNodes.length > 0 && (
          <div className="dg-designer-context-toolbar__group">
            <button className="dg-toolbar-button" onClick={() => setNodeMode('CORNER')}>Corner</button>
            <button className="dg-toolbar-button" onClick={() => setNodeMode('SMOOTH')}>Smooth</button>
            <button className="dg-toolbar-button" onClick={() => setNodeMode('SYMMETRIC')}>Symmetric</button>
          </div>
        )}
        
        {isEditing && pathSelectedSegmentIds?.length === 1 && (() => {
          const selectedSegment = el.geometry.segments.find(segment => segment.id === pathSelectedSegmentIds[0]);
          if (!selectedSegment) return null;
          const isLine = selectedSegment.type === 'LINE';
          const isCurve = selectedSegment.type === 'CUBIC_BEZIER';
          return (
          <div className="dg-designer-context-toolbar__group">
            {isCurve && <button className="dg-toolbar-button" onClick={() => convertSegment('LINE')}>To Line</button>}
            {isLine && <button className="dg-toolbar-button" onClick={() => applyToSelectedSegment(lineToCurve)}>To Curve</button>}
            {isLine && <button className="dg-toolbar-button" onClick={() => applyToSelectedSegment(lineToArc)}>To Arc</button>}
            {isCurve && <button className="dg-toolbar-button" onClick={() => applyToSelectedSegment(flipArc)}>Flip Arc</button>}
            <div className="dg-designer-context-toolbar__separator" />
            <button className="dg-toolbar-button" style={{color:'red'}} onClick={trimSegment}>Trim Segment</button>
          </div>
          );
        })()}
        
        <div className="dg-designer-context-toolbar__group">
          {interactionMode === 'SCISSORS' ? (
             <button className="dg-toolbar-button active" onClick={() => setInteractionMode?.('SELECT')}>Exit Scissors</button>
          ) : (
             <button className="dg-toolbar-button" onClick={() => setInteractionMode?.('SCISSORS')}>Scissors</button>
          )}
        </div>
        
        {!el.geometry.closed && getPathEndpoints(el.geometry).length === 2 && (
          <div className="dg-designer-context-toolbar__group">
            <button className="dg-toolbar-button" onClick={closePath}>Close Path</button>
          </div>
        )}
        
        {!isEditing && interactionMode !== 'SCISSORS' && (
          <div className="dg-designer-context-toolbar__group">
            <span className="dg-designer-context-toolbar__label">Double-click to edit path</span>
          </div>
        )}
      </>
    );
  };

  const mirror=(axis:'HORIZONTAL'|'VERTICAL')=>{
    const ids=sourceElements.filter(element=>!element.locked).map(element=>element.id);
    if(ids.length){mutate(template=>mirrorElementsAcrossArtboard(template,sourceArtboard.id,ids,axis));onMirrorInvoked?.(axis);}
  };

  return (
    <div className="dg-designer-context-toolbar" role="toolbar">
      {sourceElements.length>0&&<><div className="dg-designer-context-toolbar__group" data-page-center-mirror-tools><button className="dg-toolbar-button" title="Mirror Across Page Horizontal Center" onClick={()=>mirror('HORIZONTAL')}>↕ Mirror H</button><button className="dg-toolbar-button" title="Mirror Across Page Vertical Center" onClick={()=>mirror('VERTICAL')}>↔ Mirror V</button></div><div className="dg-designer-context-toolbar__separator" /></>}
      {mode === 'TEXT' && renderTextToolbar()}
      {mode === 'IMAGE' && renderImageToolbar()}
      {mode === 'SVG' && renderSvgToolbar()}
      {mode === 'SHAPE' && renderShapeToolbar()}
      {mode === 'PATH' && renderPathToolbar()}
      {mode === 'MULTI' && renderMultiToolbar()}
      {mode === 'ARTBOARD' && renderArtboardToolbar()}
    </div>
  );
};
