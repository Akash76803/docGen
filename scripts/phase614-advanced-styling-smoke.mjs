import {copyDesignElementStyle,createLinearGradientFill,createShapeElement,pasteDesignElementStyle,resetDesignElementStyle} from '../packages/design-engine/dist/index.js';

const source={...createShapeElement('RECTANGLE',{id:'source',xMm:4,yMm:5,widthMm:30,heightMm:12}),fill:createLinearGradientFill(45,[{offset:0,color:'#000000'},{offset:100,color:'#ffffff'}]),opacity:.6,shadow:{enabled:true,color:'#000000',opacity:.25,offsetXmm:1,offsetYmm:2,blurMm:3}};
const target={...createShapeElement('RECTANGLE',{id:'target',xMm:40,yMm:20,widthMm:12,heightMm:8}),binding:{source:'SOURCE_FIELD',path:'Employee.Name'}};
const pasted=pasteDesignElementStyle(target,copyDesignElementStyle(source));
if(pasted.id!==target.id||pasted.position.xMm!==40||pasted.binding?.path!=='Employee.Name'||pasted.opacity!==.6||pasted.fill.type!=='LINEAR_GRADIENT')throw new Error('Style paste did not preserve target data.');
const reset=resetDesignElementStyle(pasted);
if(reset.id!==target.id||reset.position.xMm!==40||reset.binding?.path!=='Employee.Name')throw new Error('Style reset did not preserve target data.');
console.log('Phase 6.1.4 advanced styling smoke PASS');
