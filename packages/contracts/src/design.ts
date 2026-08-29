

/** Phase 6.0 shared Visual Design Studio contracts. Physical geometry is canonical in millimetres. */
export type DesignTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DesignUnit = 'MM' | 'IN';
export type DesignHorizontalAlignment = 'LEFT' | 'CENTER' | 'RIGHT';
export type DesignVerticalAlignment = 'TOP' | 'CENTER' | 'BOTTOM';
export type GuideOrientation = 'HORIZONTAL' | 'VERTICAL';
export type DesignElementKind = 'TEXT' | 'SHAPE' | 'IMAGE' | 'SVG' | 'QR' | 'BARCODE' | 'PATH' | 'CUSTOM';
export type DesignShapeKind = 'RECTANGLE' | 'SQUARE' | 'ROUNDED_RECTANGLE' | 'CAPSULE' | 'CIRCLE' | 'ELLIPSE' | 'LINE' | 'TRIANGLE' | 'RIGHT_TRIANGLE' | 'DIAMOND' | 'PENTAGON' | 'HEXAGON' | 'OCTAGON' | 'TRAPEZOID' | 'PARALLELOGRAM' | 'ARROW' | 'DOUBLE_ARROW' | 'CURVED_ARROW' | 'CHEVRON' | 'DOUBLE_CHEVRON' | 'STAR' | 'POLYGON' | 'HEART' | 'CLOUD' | 'SPEECH_BUBBLE' | 'CALLOUT' | 'DOCUMENT' | 'CYLINDER' | 'CROSS' | 'PLUS' | 'BANNER' | 'SHIELD' | 'RIBBON' | 'BADGE' | 'HALF_CIRCLE' | 'ARC' | 'BRACKET' | 'LABEL_TAG' | 'FLEXIBLE_LINE';
export type DesignBindingSource = 'FIELD' | 'CALCULATED' | 'STATIC';

export type ArtboardRole = 'FRONT' | 'BACK' | 'INSIDE' | 'OUTSIDE' | 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'GENERIC';
export type ArtboardTargetMode = 'CURRENT' | 'SELECTED' | 'ALL';

export interface DesignPoint { xMm:number; yMm:number; }
export interface DesignSize { widthMm:number; heightMm:number; }
export interface DesignInsets { topMm:number; rightMm:number; bottomMm:number; leftMm:number; }
export interface DesignStroke { color:string; widthMm:number; style:'SOLID'|'DASHED'|'DOTTED'|'NONE'; opacity?:number; }
export interface DesignShadow { enabled:boolean; offsetXmm:number; offsetYmm:number; blurMm:number; color:string; opacity:number; }
export interface DesignGradientStop { offset:number; color:string; opacity?:number; }
export interface DesignLinearGradient { type:'LINEAR'; angleDeg:number; stops:DesignGradientStop[]; }
export type DesignFill =
  | { type:'NONE' }
  | { type:'SOLID'; color:string; opacity?:number }
  | { type:'LINEAR_GRADIENT'; gradient:DesignLinearGradient }
  | { type:'IMAGE'; assetId:string; fit:'FIT'|'FILL'|'STRETCH'; opacity?:number };

export interface DesignBindingFormat {
  type?: 'TEXT' | 'NUMBER' | 'DATE' | 'DATETIME' | 'CURRENCY' | 'PERCENT';
  locale?: string;
  pattern?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export interface DesignBinding {
  id: string;
  targetProperty: string;
  sourceType: DesignBindingSource;

  // Generic resolved path, datasource agnostic
  fieldPath?: string;

  // For future calculated/global fields
  calculatedFieldId?: string;

  // Optional static fallback/default
  fallbackValue?: unknown;

  // Formatting metadata only
  format?: DesignBindingFormat;

  // Future-safe metadata
  metadata?: Record<string, unknown>;
}

export interface DesignDataContext {
  record?: Record<string, unknown>;
  globals?: Record<string, unknown>;
  calculated?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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
  metadata?:AssetMetadata;
}

export interface AssetMetadata extends Record<string,unknown> {
  originalFileName?:string;
  source?:string;
  license?:string;
  category?:string;
  subcategory?:string;
  folder?:string;
  tags?:string[];
  format?:'SVG'|'RASTER';
  builtIn?:boolean;
  userUploaded?:boolean;
  importedAt?:string;
  originalWidth?:number;
  originalHeight?:number;
  viewBox?:string;
  aspectRatio?:number;
  fingerprint?:string;
  sanitized?:boolean;
  normalized?:boolean;
  fallbackDimensions?:boolean;
  recolorable?:boolean;
}

export interface Guide {
  id:string;
  orientation:GuideOrientation;
  positionMm:number;
  locked?:boolean;
}

export type VisibilityOperator = 
  | 'EQUALS' | 'NOT_EQUALS'
  | 'CONTAINS' | 'NOT_CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'
  | 'GREATER_THAN' | 'GREATER_OR_EQUAL' | 'LESS_THAN' | 'LESS_OR_EQUAL'
  | 'BEFORE' | 'AFTER' | 'ON_OR_BEFORE' | 'ON_OR_AFTER'
  | 'IS_EMPTY' | 'IS_NOT_EMPTY';

export interface ElementVisibilityRule {
  id: string;
  enabled: boolean;
  fieldPath: string;
  operator: VisibilityOperator;
  value?: unknown;
}

export interface DesignGroup {
  id:string;
  name:string;
  elementIds:string[];
  parentGroupId?:string;
  locked?:boolean;
  visible?:boolean;
  visibilityRule?:ElementVisibilityRule;
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
  bindings?:DesignBinding[];
  metadata?:Record<string,unknown>;
  visibilityRule?:ElementVisibilityRule;
  runtimeHidden?:boolean; // Runtime evaluation result, never persisted
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
  shadow?:DesignShadow;
  textBindingMode?:'FULL'|'TEMPLATE';
}

export interface ShapeTextStyle {
  text:string;
  enabled:boolean;
  fontFamily:string;
  fontSizePt:number;
  fontWeight:number;
  italic:boolean;
  underline:boolean;
  color:string;
  alignment:DesignHorizontalAlignment;
  verticalAlignment:DesignVerticalAlignment;
  paddingMm:number;
  lineHeight:number;
}

export interface ShapeDesignElement extends BaseDesignElement {
  type:'SHAPE';
  shape:DesignShapeKind;
  fill:DesignFill;
  stroke:DesignStroke;
  cornerRadiusMm?:number;
  points?:DesignPoint[];
  shadow?:DesignShadow;
  label?:ShapeTextStyle;
  flipX?:boolean;
  flipY?:boolean;
}

export type PathPointMode = 'CORNER' | 'SMOOTH' | 'SYMMETRIC';

export interface PathPoint {
  id: string;
  x: number;
  y: number;
  inHandle?: { x: number; y: number };
  outHandle?: { x: number; y: number };
  mode?: PathPointMode;
}

export type PathSegment = 
  | { id: string; type: 'LINE'; fromPointId: string; toPointId: string; }
  | { id: string; type: 'CUBIC_BEZIER'; fromPointId: string; toPointId: string; };

export interface PathGeometry {
  points: PathPoint[];
  segments: PathSegment[];
  closed: boolean;
  subpaths?: {
    closed: boolean;
    segmentIds: string[];
  }[];
}

export interface PathDesignElement extends BaseDesignElement {
  type: 'PATH';
  geometry: PathGeometry;
  fill: DesignFill;
  stroke: DesignStroke;
  shadow?: DesignShadow;
  label?: ShapeTextStyle;
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
  shadow?:DesignShadow;
}

export interface SvgDesignElement extends BaseDesignElement {
  type:'SVG';
  assetId:string;
  preserveVector?:boolean;
  stroke?:DesignStroke;
  shadow?:DesignShadow;
  tintColor?:string;
  flipX?:boolean;
  flipY?:boolean;
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

export type DesignElement = TextDesignElement|ShapeDesignElement|ImageDesignElement|SvgDesignElement|QrDesignElement|BarcodeDesignElement|PathDesignElement|CustomDesignElement;

export interface ArtboardPrintSettings {
  bleed:DesignInsets;
  safeArea:DesignInsets;
  cropMarksEnabledForExport?:boolean;
  showBleedInEditor?:boolean;
  showSafeAreaInEditor?:boolean;
  showCropMarksInEditor?:boolean;
  minimumRasterDpi?:number;
  preferredRasterDpi?:number;
  profileId?:string;
  profileVersion?:number;
}

export type PrintQualityStatus='GOOD'|'WARNING'|'LOW'|'UNKNOWN'|'VECTOR';
export interface RasterDpiResult {dpiX?:number;dpiY?:number;effectiveDpi?:number;status:PrintQualityStatus;message:string;}
export type PrintValidationSeverity='INFO'|'WARNING'|'ERROR';
export interface PrintValidationIssue {id:string;code:string;severity:PrintValidationSeverity;artboardId:string;elementId?:string;message:string;details?:Record<string,unknown>;}
export interface ArtboardPrintValidationResult {artboardId:string;issues:PrintValidationIssue[];errors:number;warnings:number;info:number;}
export interface DesignPrintValidationResult {artboards:ArtboardPrintValidationResult[];issues:PrintValidationIssue[];errors:number;warnings:number;info:number;}

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
  role?:ArtboardRole;
  pairId?:string;
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
  role?:ArtboardRole;
  pairId?:string;
}

export interface ArtboardTarget {
  mode:ArtboardTargetMode;
  artboardIds:string[];
  orderedArtboards:Artboard[];
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
  | 'ARTBOARD_PAIR_INVALID'
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
