import React, { useState } from 'react';
import { Type, Square, ImagePlus, QrCode, Barcode } from 'lucide-react';
import { DesignShapeKind } from '@document-tool/contracts';

const shapeLabel = (s: DesignShapeKind) => s.toLowerCase().split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

export type ElementLibraryPanelProps = {
  onInsertText: () => void;
  onInsertShape: (shape: DesignShapeKind) => void;
  onUploadImage: () => void;
  onAddQr?: () => void;
  onAddBarcode?: () => void;
  availableShapes: DesignShapeKind[];
};

export const ElementLibraryPanel: React.FC<ElementLibraryPanelProps> = ({
  onInsertText,
  onInsertShape,
  onUploadImage,
  onAddQr,
  onAddBarcode,
  availableShapes
}) => {
  const [search, setSearch] = useState('');

  const basicElements = [
    { id: 'text', label: 'Text', icon: <Type size={20} strokeWidth={1.5} />, action: onInsertText },
    { id: 'shape', label: 'Shape', icon: <Square size={20} strokeWidth={1.5} />, action: () => onInsertShape('RECTANGLE') },
    { id: 'image', label: 'Image', icon: <ImagePlus size={20} strokeWidth={1.5} />, action: onUploadImage }
  ];

  const dynamicElements = [];
  if (onAddQr) dynamicElements.push({ id: 'qr', label: 'QR Code', icon: <QrCode size={20} strokeWidth={1.5} />, action: onAddQr });
  if (onAddBarcode) dynamicElements.push({ id: 'barcode', label: 'Barcode', icon: <Barcode size={20} strokeWidth={1.5} />, action: onAddBarcode });

  const filteredBasic = basicElements.filter(e => e.label.toLowerCase().includes(search.toLowerCase()));
  const filteredDynamic = dynamicElements.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search.toLowerCase()));
  
  const shapes = availableShapes.map(s => ({
    id: `shape-${s}`,
    label: shapeLabel(s),
    icon: <Square size={20} strokeWidth={1.5} />,
    action: () => onInsertShape(s)
  }));
  
  const filteredShapes = shapes.filter(s => s.label.toLowerCase().includes(search.toLowerCase()) && s.id !== 'shape-RECTANGLE');

  return (
    <div className="dg-element-library">
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
    </div>
  );
};
