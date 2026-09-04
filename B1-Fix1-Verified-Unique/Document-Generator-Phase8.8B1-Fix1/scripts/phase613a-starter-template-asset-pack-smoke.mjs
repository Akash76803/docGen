import { DESIGN_STARTER_TEMPLATES,DECORATIVE_ASSETS,validateDesignTemplate } from '../packages/design-engine/dist/index.js';
const result=DESIGN_STARTER_TEMPLATES.map((starter,index)=>{
  const t=starter.create(prefix=>`${prefix}-${index}`);
  const validation=validateDesignTemplate(t);
  if(!validation.valid)throw new Error(`${starter.name}: ${validation.errors.map(e=>e.message).join('; ')}`);
  return {name:starter.name,artboards:t.artboards.length,elements:t.artboards.reduce((n,a)=>n+a.elements.length,0),assets:t.sharedAssets.length};
});
console.log(JSON.stringify({status:'PASS',phase:'6.1.3A',templates:result,decorativeAssets:DECORATIVE_ASSETS.length},null,2));
