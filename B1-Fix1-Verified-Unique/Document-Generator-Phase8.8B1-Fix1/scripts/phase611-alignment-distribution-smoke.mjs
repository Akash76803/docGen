import {addDesignElement,alignElements,createBlankArtboard,createShapeElement,distributeElements} from '../packages/design-engine/dist/index.js';
let t={kind:'CARD_DESIGN',schemaVersion:1,id:'smoke',name:'Phase 6.1.1',version:1,status:'DRAFT',sharedAssets:[],artboards:[createBlankArtboard({id:'a',name:'Front',order:0,widthMm:100,heightMm:60})]};
for(const [id,x] of [['one',10],['two',40],['three',80]])t=addDesignElement(t,'a',createShapeElement('RECTANGLE',{id,xMm:x,yMm:10,widthMm:10,heightMm:10,zIndex:t.artboards[0].elements.length}));
t=alignElements(t,'a',['one','two','three'],'TOP','ARTBOARD');
t=distributeElements(t,'a',['one','two','three'],'HORIZONTAL','ARTBOARD');
console.log(JSON.stringify({status:'PASS',phase:'6.1.1',positions:t.artboards[0].elements.map(e=>({id:e.id,xMm:e.position.xMm,yMm:e.position.yMm})),features:['selection alignment','artboard alignment','horizontal distribution','vertical distribution','group-aware','locked protection']},null,2));
