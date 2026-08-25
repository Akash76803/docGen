import type { DisplayFormatDefinition } from './template.js';

/** Phase 6.0 shared Visual Design Studio contracts. Physical geometry is canonical in millimetres. */
export type DesignTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DesignUnit = 'MM' | 'IN';
export type DesignHorizontalAlignment = 'LEFT' | 'CENTER' | 'RIGHT';
export type DesignVerticalAlignment = 'TOP' | 'CENTER' | 'BOTTOM';
export type GuideOrientation = 'HORIZONTAL' | 'VERTICAL';
export type DesignElementKind = 'TEXT' | 'SHAPE' | 'IMAGE' | 'SVG' | 'QR' | 'BARCODE' | 'CUSTOM';
export type DesignShapeKind = 'RECTANGLE' | 'ROUNDED_RECTANGLE' | 'CIRCLE' | 'ELLIPSE' | 'LINE' | 'TRIANGLE' | 'ARROW' | 'STAR' | 'POLYGON' | 'RIBBON' | 'BADGE';
export type DesignBindingSource = 'STATIC' | 'SOURCE_FIELD' | 'DATA_VIEW' | 'CALCULATED_FIELD';
export type MissingBindingBehavior = 'BLANK' | 'FALLBACK' | 'HIDE' | 'WARNING';

export interface DesignPoint { xMm:number; yMm:number; }
export interface DesignSize { widthMm:number; heightMm:number; }
export interface DesignInsets { topMm:number; rightMm:number; bottomMm:number; leftMm:number; }
export interface DesignStroke { color:string; widthMm:number; style:'SOLID'|'DASHED'|'DOTTED'|'NONE'; }
export interface DesignShadow { enabled:boolean; offsetXmm:number; offsetYmm:number; blurMm:number; color:string; opacity:number; }
export interface DesignGradientStop { offset:number; color:string; opacity?:number; }
export interface DesignLinearGradient { type:'LINEAR'; angleDeg:number; stops:DesignGradientStop[]; }
export type DesignFill =
  | { type:'NONE' }
  | { type:'SOLID'; color:string; opacity?:number }
  | { type:'LINEAR_GRADIENT'; gradient:DesignLinearGradient }
  | { type:'IMAGE'; assetId:string; fit:'FIT'|'FILL'|'STRETCH'; opacity?:number };

export interface DesignBinding {
  source: DesignBindingSource;
  /** Canonical source/calculated/view path or alias. STATIC bindings may omit this. */
  path?: string;
  staticValue?: string|number|boolean|null;
  fallback?: string;
  missingBehavior?: MissingBindingBehavior;
  displayFormat?: DisplayFormatDefinition;
}

export interface AssetReference {
  id:string;
  name:string;
  kind:'IMAGE'|'SVG'|'LOGO'|'ICON'|'DECORATION'|'FRAME'|'OTHER';
  sourceType:'DATA_URL'|'LOCAL_ASSET'|'EMBEDDED';
  source:string;
  mimeType?:string;
  widthPx?:number;
  heightPx?:number;
  metadata?:Record<string,unknown>;
}

export interface Guide {
  id:string;
  orientation:GuideOrientation;
  positionMm:number;
  locked?:boolean;
}

export interface DesignGroup {
  id:string;
  name:string;
  elementIds:string[];
  parentGroupId?:string;
  locked?:boolean;
  visible?:boolean;
}

export interface BaseDesignElement {
  id:string;
  type:DesignElementKind;
  name:string;
  position:DesignPoint;
  size:DesignSize;
  rotationDeg:number;
  opacity:number;
  visible:boolean;
  locked:boolean;
  zIndex:number;
  groupId?:string;
  binding?:DesignBinding;
  metadata?:Record<string,unknown>;
}

export interface TextDesignElement extends BaseDesignElement {
  type:'TEXT';
  text:string;
  style:{
    fontFamily:string;
    fontSizePt:number;
    fontWeight:number;
    italic:boolean;
    underline:boolean;
    color:string;
    alignment:DesignHorizontalAlignment;
    lineHeight:number;
    letterSpacingPt:number;
  };
}

export interface ShapeDesignElement extends BaseDesignElement {
  type:'SHAPE';
  shape:DesignShapeKind;
  fill:DesignFill;
  stroke:DesignStroke;
  cornerRadiusMm?:number;
  points?:DesignPoint[];
  shadow?:DesignShadow;
}

export interface ImageDesignElement extends BaseDesignElement {
  type:'IMAGE';
  assetId:string;
  fit:'FIT'|'FILL'|'STRETCH';
  flipX?:boolean;
  flipY?:boolean;
  maintainAspectRatio?:boolean;
  cornerRadiusMm?:number;
  stroke?:DesignStroke;
}

export interface SvgDesignElement extends BaseDesignElement {
  type:'SVG';
  assetId:string;
  preserveVector?:boolean;
}

export interface QrDesignElement extends BaseDesignElement {
  type:'QR';
  value:string;
  foreground:string;
  background:string;
  errorCorrection:'L'|'M'|'Q'|'H';
}

export interface BarcodeDesignElement extends BaseDesignElement {
  type:'BARCODE';
  value:string;
  symbology:string;
  foreground:string;
  background:string;
}

/** Extension point for future/shared Design Engine element types without renderer one-offs. */
export interface CustomDesignElement extends BaseDesignElement {
  type:'CUSTOM';
  customType:string;
  props:Record<string,unknown>;
}

export type DesignElement = TextDesignElement|ShapeDesignElement|ImageDesignElement|SvgDesignElement|QrDesignElement|BarcodeDesignElement|CustomDesignElement;

export interface ArtboardPrintSettings {
  bleed:DesignInsets;
  safeArea:DesignInsets;
}

export interface Artboard {
  id:string;
  name:string;
  order:number;
  widthMm:number;
  heightMm:number;
  displayUnit:DesignUnit;
  background:DesignFill;
  print:ArtboardPrintSettings;
  guides:Guide[];
  groups:DesignGroup[];
  elements:DesignElement[];
  metadata?:Record<string,unknown>;
}

export interface CardDataConfiguration {
  sourceId?:string;
  groupKeyPath?:string;
  metadata?:Record<string,unknown>;
}

export interface DesignTemplate {
  kind:'CARD_DESIGN';
  schemaVersion:number;
  id:string;
  name:string;
  version:number;
  status:DesignTemplateStatus;
  artboards:Artboard[];
  sharedAssets:AssetReference[];
  dataConfiguration?:CardDataConfiguration;
  metadata?:Record<string,unknown>;
}

/** Renderer-ready values. Bindings/business rules are resolved before this model is created. */
export interface ResolvedDesignElement extends Omit<BaseDesignElement,'binding'> {
  type:DesignElementKind;
  sourceElementType:string;
  content:Record<string,unknown>;
}

export interface ResolvedArtboard {
  id:string;
  name:string;
  order:number;
  widthMm:number;
  heightMm:number;
  background:DesignFill;
  print:ArtboardPrintSettings;
  elements:ResolvedDesignElement[];
}

export interface CardRenderModel {
  modelVersion:1;
  templateId:string;
  templateVersion:number;
  recordKey?:string;
  artboards:ResolvedArtboard[];
  metadata?:Record<string,unknown>;
}

export type DesignValidationSeverity='ERROR'|'WARNING';
export type DesignValidationCode =
  | 'DESIGN_TEMPLATE_INVALID'
  | 'ARTBOARD_REQUIRED'
  | 'ARTBOARD_ID_DUPLICATE'
  | 'ARTBOARD_NAME_REQUIRED'
  | 'ARTBOARD_DIMENSION_INVALID'
  | 'ARTBOARD_ORDER_DUPLICATE'
  | 'ELEMENT_ID_DUPLICATE'
  | 'ELEMENT_TYPE_UNSUPPORTED'
  | 'ELEMENT_GEOMETRY_INVALID'
  | 'ELEMENT_OPACITY_INVALID'
  | 'ELEMENT_GROUP_MISSING'
  | 'GROUP_ID_DUPLICATE'
  | 'GROUP_ELEMENT_MISSING'
  | 'GROUP_PARENT_MISSING'
  | 'GROUP_CYCLE'
  | 'GUIDE_ID_DUPLICATE'
  | 'GUIDE_POSITION_INVALID'
  | 'ASSET_ID_DUPLICATE'
  | 'ASSET_REFERENCE_MISSING'
  | 'BINDING_INVALID';
export interface DesignValidationIssue { code:DesignValidationCode; severity:DesignValidationSeverity; message:string; artboardId?:string; elementId?:string; }
export interface DesignValidationResult { valid:boolean; errors:DesignValidationIssue[]; warnings:DesignValidationIssue[]; }
