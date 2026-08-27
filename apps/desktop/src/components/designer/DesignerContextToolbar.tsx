import React from 'react';
import type { Artboard, DesignElement, DesignTemplate, TextDesignElement, ImageDesignElement, SvgDesignElement, ShapeDesignElement } from '@document-tool/contracts';
import { 
  updateDesignElement,
  alignElements,
  distributeElements
} from '@document-tool/design-engine';
import { DesignerToolbarMode } from './designerToolbarConfig.js';
import { AlignLeft, AlignCenter, AlignRight, AlignHorizontalSpaceAround, AlignVerticalSpaceAround } from 'lucide-react';

export type DesignerContextToolbarProps = {
  mode: DesignerToolbarMode;
  sourceArtboard: Artboard;
  sourceElements: DesignElement[];
  mutate: (fn: (t: DesignTemplate) => DesignTemplate) => void;
  // Passing existing top-level handlers for grouping, since they might handle selection updates
  onGroupSelected?: () => void;
  onUngroupSelected?: () => void;
};

export const DesignerContextToolbar: React.FC<DesignerContextToolbarProps> = ({
  mode, sourceArtboard, sourceElements, mutate, onGroupSelected, onUngroupSelected
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
      </>
    );
  };

  const renderMultiToolbar = () => {
    const ids = sourceElements.map(e => e.id);
    const unitCount = sourceElements.length;
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

  return (
    <div className="dg-designer-context-toolbar" role="toolbar">
      {mode === 'TEXT' && renderTextToolbar()}
      {mode === 'IMAGE' && renderImageToolbar()}
      {mode === 'SVG' && renderSvgToolbar()}
      {mode === 'SHAPE' && renderShapeToolbar()}
      {mode === 'MULTI' && renderMultiToolbar()}
      {mode === 'ARTBOARD' && renderArtboardToolbar()}
    </div>
  );
};
