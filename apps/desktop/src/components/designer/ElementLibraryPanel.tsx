import React, { useState } from 'react';
import { Type, Square, ImagePlus, QrCode, Barcode, PenTool, Spline, Scissors, BetweenHorizontalStart, GitMerge, BoxSelect, MousePointer2, Eraser, PaintBucket, Slice } from 'lucide-react';
import { DesignShapeKind } from '@document-tool/contracts';

const shapeLabel = (s: DesignShapeKind) => s.toLowerCase().split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

export type ElementLibraryPanelProps = {
  onInsertText: () => void;
  onInsertShape: (shape: DesignShapeKind) => void;
  onUploadImage: () => void;
  onAddQr?: () => void;
  onAddBarcode?: () => void;
  availableShapes: DesignShapeKind[];
  interactionMode?: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE' | 'SPLIT';
  drawShapeType?: DesignShapeKind | null;
  onSetInteractionMode?: (mode: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE' | 'SPLIT') => void;
  fillBucketType?: 'SOLID' | 'NONE';
  fillBucketColor?: string;
  onFillBucketTypeChange?: (type:'SOLID'|'NONE')=>void;
  onFillBucketColorChange?: (color:string)=>void;
  onSetDrawShapeType?: (type: DesignShapeKind | null) => void;
  canEditPath?: boolean;
  canScissors?: boolean;
  canTrim?: boolean;
  canJoin?: boolean;
  onJoin?: () => void;
  canClose?: boolean;
  onClose?: () => void;
};

export const ElementLibraryPanel: React.FC<ElementLibraryPanelProps> = ({
  onInsertText,
  onUploadImage,
  onAddQr,
  onAddBarcode,
  availableShapes,
  interactionMode = 'SELECT',
  drawShapeType = null,
  onSetInteractionMode,
  onSetDrawShapeType,
  canEditPath = false,
  canScissors = false,
  canTrim = false,
  canJoin = false,
  onJoin,
  canClose = false,
  onClose
  ,fillBucketType='SOLID',fillBucketColor='#3b82f6',onFillBucketTypeChange,onFillBucketColorChange
}) => {
  const [search, setSearch] = useState('');

  const basicElements = [
    { id: 'text', label: 'Text', icon: <Type size={20} strokeWidth={1.5} />, action: onInsertText },
    { id: 'shape', label: 'Shape', icon: <Square size={20} strokeWidth={1.5} />, action: () => {
      onSetDrawShapeType?.('RECTANGLE');
      onSetInteractionMode?.('DRAW_SHAPE');
    }, active: interactionMode === 'DRAW_SHAPE' && drawShapeType === 'RECTANGLE' },
    { id: 'image', label: 'Image', icon: <ImagePlus size={20} strokeWidth={1.5} />, action: onUploadImage }
  ];

  const dynamicElements = [];
  if (onAddQr) dynamicElements.push({ id: 'qr', label: 'QR Code', icon: <QrCode size={20} strokeWidth={1.5} />, action: onAddQr });
  if (onAddBarcode) dynamicElements.push({ id: 'barcode', label: 'Barcode', icon: <Barcode size={20} strokeWidth={1.5} />, action: onAddBarcode });

  const filteredBasic = basicElements.filter(e => e.label.toLowerCase().includes(search.toLowerCase()));
  const filteredDynamic = dynamicElements.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search.toLowerCase()));
  
  const shapes = availableShapes.map(s => ({
    id: `shape-${s.toLowerCase()}`,
    label: shapeLabel(s),
    icon: <Square size={20} strokeWidth={1.5} />,
    action: () => {
      onSetDrawShapeType?.(s);
      onSetInteractionMode?.('DRAW_SHAPE');
    },
    active: interactionMode === 'DRAW_SHAPE' && drawShapeType === s
  }));
  
  const filteredShapes = shapes.filter(s => s.label.toLowerCase().includes(search.toLowerCase()) && s.id !== 'shape-rectangle');

  const utilityElements = [
    { id: 'select', label: 'Select Tool', tooltip: 'Exit the active drawing or trimming tool', icon: <MousePointer2 size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('SELECT'), active: interactionMode === 'SELECT' },
    { id: 'flexible-line', label: 'Flexible Line', tooltip: 'Draw and bend editable lines', icon: <Spline size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('FLEXIBLE_LINE'), active: interactionMode === 'FLEXIBLE_LINE' },
    { id: 'divider', label: 'Divider', tooltip: 'Divider — draw across a closed shape or filled section to create new independently fillable sections', icon: <Slice size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('SPLIT'), active: interactionMode === 'SPLIT' },
    { id: 'pen', label: 'Pen Tool', tooltip: 'Draw custom paths', icon: <PenTool size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('PEN'), active: interactionMode === 'PEN' },
    { id: 'edit-path', label: 'Edit Path', tooltip: 'Edit path nodes and curves', icon: <Spline size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('EDIT_PATH'), active: interactionMode === 'EDIT_PATH', disabled: !canEditPath },
    { id: 'scissors', label: 'Scissors', tooltip: 'Scissors — insert a node by cutting one path segment at the clicked point', icon: <Scissors size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('SCISSORS'), active: interactionMode === 'SCISSORS', disabled: !canScissors },
    { id: 'trimmer', label: 'Erase Segment', tooltip: 'Erase Segment — remove the path interval between intersections or selected points', icon: <BetweenHorizontalStart size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('TRIMMER'), active: interactionMode === 'TRIMMER', disabled: !canTrim },
    { id: 'eraser', label: 'Freeform Eraser', tooltip: 'Draw a freeform selection around unlocked elements to erase them', icon: <Eraser size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('ERASER'), active: interactionMode === 'ERASER' },
    { id: 'fill-bucket', label: 'Fill Bucket', tooltip: 'Fill a closed shape or section', icon: <PaintBucket size={20} strokeWidth={1.5} />, action: () => onSetInteractionMode?.('FILL_BUCKET'), active: interactionMode === 'FILL_BUCKET' },
    { id: 'join-path', label: 'Join Path', tooltip: 'Join two open paths', icon: <GitMerge size={20} strokeWidth={1.5} />, action: () => onJoin?.(), disabled: !canJoin },
    { id: 'close-path', label: 'Close Path', tooltip: 'Close an open path', icon: <BoxSelect size={20} strokeWidth={1.5} />, action: () => onClose?.(), disabled: !canClose },
  ];

  const filteredUtility = utilityElements.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search.toLowerCase()) || (search.toLowerCase() === 'trim' && e.id === 'trimmer'));

  return (
    <div className="dg-element-library">
      {interactionMode==='FILL_BUCKET'&&<div data-fill-bucket-controls style={{display:'grid',gap:8,padding:'10px',marginBottom:8,border:'1px solid var(--border-color)',borderRadius:6}}>
        <strong style={{fontSize:12}}>Fill Bucket</strong>
        <label style={{fontSize:11}}>Fill type<select value={fillBucketType} onChange={e=>onFillBucketTypeChange?.(e.target.value as 'SOLID'|'NONE')}><option value="SOLID">Solid</option><option value="NONE">Transparent / No Fill</option></select></label>
        {fillBucketType==='SOLID'&&<label style={{fontSize:11}}>Color <input aria-label="Fill bucket color" type="color" value={fillBucketColor} onChange={e=>onFillBucketColorChange?.(e.target.value)}/></label>}
        <small style={{color:'var(--text-secondary)'}}>Click a closed shape or section. Open boundaries cannot be filled.</small>
      </div>}
      <div className="dg-element-library__search">
        <input 
          type="text" 
          placeholder="Search elements..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          aria-label="Search elements"
        />
      </div>
      
      {(filteredBasic.length > 0 || search === '') && (
        <div className="dg-element-library__section">
          <h3 className="dg-element-library__section-title">Basic</h3>
          <div className="dg-element-library__grid">
            {filteredBasic.map(el => (
              <button key={el.id} className="dg-element-library__item" onClick={el.action} title={`Add ${el.label}`}>
                {el.icon}
                <span>{el.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(filteredShapes.length > 0 || search === '') && (
        <div className="dg-element-library__section">
          <h3 className="dg-element-library__section-title">More Shapes</h3>
          <div className="dg-element-library__grid">
            {filteredShapes.map(el => (
              <button key={el.id} className="dg-element-library__item" onClick={el.action} title={`Add ${el.label}`}>
                {el.icon}
                <span>{el.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(filteredDynamic.length > 0 || search === '') && dynamicElements.length > 0 && (
        <div className="dg-element-library__section">
          <h3 className="dg-element-library__section-title">Dynamic</h3>
          <div className="dg-element-library__grid">
            {filteredDynamic.map(el => (
              <button key={el.id} className="dg-element-library__item" onClick={el.action} title={`Add ${el.label}`}>
                {el.icon}
                <span>{el.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(filteredUtility.length > 0 || search === '') && utilityElements.some(e => filteredUtility.includes(e)) && (
        <div className="dg-element-library__section">
          <h3 className="dg-element-library__section-title">Utility</h3>
          <div className="dg-element-library__grid">
            {filteredUtility.map(el => (
              <button 
                key={el.id} 
                className={`dg-element-library__item ${el.active ? 'active' : ''}`} 
                onClick={el.action} 
                disabled={el.disabled}
                title={el.disabled ? (el.id === 'edit-path' || el.id === 'scissors' || el.id === 'trimmer' ? 'Select exactly 1 path to use this tool' : el.id === 'join-path' ? 'Select exactly 2 open paths to join' : el.id === 'close-path' ? 'Select exactly 1 open path to close' : el.tooltip) : el.tooltip}
              >
                {el.icon}
                <span>{el.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
