import {assetRenderKind,fingerprintAssetContent,normalizeSvgSource,prepareAssetImport,sanitizeSvgSource} from '../packages/design-engine/dist/index.js';

const unsafe='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" onload="bad()"><script>bad()</script><use href="#safe"/><image href="https://example.com/bad.png"/><path fill="currentColor" d="M0 0h10v10z"/></svg>';
const sanitized=sanitizeSvgSource(unsafe);
if(/script|onload|https:\/\//i.test(sanitized)||!sanitized.includes('href="#safe"'))throw new Error('SVG sanitization failed.');
const normalized=normalizeSvgSource(unsafe);
const fingerprint=fingerprintAssetContent(normalized.source);
if(!fingerprint||normalized.viewBox!=='0 0 40 20'||normalized.aspectRatio!==2)throw new Error('SVG normalization failed.');
const source=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(unsafe)}`;
const first=prepareAssetImport({id:'asset-1',name:'Safe SVG',fileName:'safe.svg',mimeType:'image/svg+xml',source,sizeBytes:unsafe.length});
const duplicate=prepareAssetImport({id:'asset-2',name:'Duplicate SVG',fileName:'duplicate.svg',mimeType:'image/svg+xml',source,sizeBytes:unsafe.length,existing:[first.asset]});
if(duplicate.asset.id!=='asset-1'||assetRenderKind(first.asset)!=='VECTOR_SVG'||first.asset.metadata?.format!=='SVG')throw new Error('Asset preparation failed.');
console.log('Phase 6.2 SVG asset hardening smoke PASS');
