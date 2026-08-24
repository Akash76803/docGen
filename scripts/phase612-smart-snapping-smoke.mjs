import { createBlankArtboard,createShapeElement,snapMoveDelta,snapResizeSize } from '../packages/design-engine/dist/index.js';
const moving=createShapeElement('RECTANGLE',{id:'moving',name:'Moving',xMm:39.2,yMm:19.3,widthMm:20,heightMm:20});
const target=createShapeElement('RECTANGLE',{id:'target',name:'Target',xMm:70,yMm:40,widthMm:10,heightMm:10});
const artboard={...createBlankArtboard({id:'a',name:'Front',order:0,widthMm:100,heightMm:60}),elements:[moving,target],guides:[{id:'v',orientation:'VERTICAL',positionMm:25}]};
const move=snapMoveDelta(artboard,['moving'],{xMm:0.4,yMm:0.5},{toleranceMm:1.5});
const resize=snapResizeSize(artboard,moving,'SE',{widthMm:30.4,heightMm:20.6},{toleranceMm:1.5});
if(!move.guides.length||!resize.guides.length)throw new Error('Snapping smoke failed');
console.log(JSON.stringify({status:'PASS',phase:'6.1.2',move,resize,features:['artboard','elements','guides','grid-ready','move','resize','smart-guides']},null,2));
