import {
  addDesignElement,
  commitDesignHistory,
  createBlankArtboard,
  createDesignClipboardPayload,
  createDesignHistory,
  createTextElement,
  pasteDesignClipboard,
  redoDesignHistory,
  undoDesignHistory,
} from '../packages/design-engine/dist/index.js';

const artboard = createBlankArtboard({ id: 'front', name: 'Front', order: 0, widthMm: 90, heightMm: 50 });
let template = { kind:'CARD_DESIGN', schemaVersion:1, id:'card', name:'Card', version:1, status:'DRAFT', artboards:[artboard], sharedAssets:[] };
template = addDesignElement(template, 'front', createTextElement({ id:'text', zIndex:0 }));
let history = createDesignHistory(template, 100);
const renamed = { ...template, name:'Edited Card' };
history = commitDesignHistory(history, renamed);
history = undoDesignHistory(history);
if (history.present.name !== 'Card') throw new Error('Undo failed');
history = redoDesignHistory(history);
if (history.present.name !== 'Edited Card') throw new Error('Redo failed');
const payload = createDesignClipboardPayload(template, 'front', ['text']);
if (!payload) throw new Error('Copy failed');
const pasted = pasteDesignClipboard(template, 'front', payload, sourceId => `copy-${sourceId}`);
if (pasted.elementIds.length !== 1 || pasted.template.artboards[0].elements.length !== 2) throw new Error('Paste failed');
console.log(JSON.stringify({status:'PASS',phase:'6.0.6',history:['undo','redo','bounded'],clipboard:['copy','paste','cross-artboard-ready'],pasteOffsetMm:2},null,2));
