import type { DesignElement, DesignTemplate, PathDesignElement, PathGeometry } from '@document-tool/contracts';

export type MirrorAxis = 'HORIZONTAL'|'VERTICAL';

function clone<T>(value:T):T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function reflectPathGeometry(geometry:PathGeometry,widthMm:number,heightMm:number,axis:MirrorAxis):PathGeometry {
  const next=clone(geometry);
  next.points=next.points.map(point=>{
    const reflected={...point};
    if(axis==='VERTICAL'){
      reflected.x=widthMm-point.x;
      if(point.inHandle) reflected.inHandle={x:widthMm-point.inHandle.x,y:point.inHandle.y};
      if(point.outHandle) reflected.outHandle={x:widthMm-point.outHandle.x,y:point.outHandle.y};
    }else{
      reflected.y=heightMm-point.y;
      if(point.inHandle) reflected.inHandle={x:point.inHandle.x,y:heightMm-point.inHandle.y};
      if(point.outHandle) reflected.outHandle={x:point.outHandle.x,y:heightMm-point.outHandle.y};
    }
    reflected.id=crypto.randomUUID();
    return reflected;
  });
  const idMap=new Map(geometry.points.map((point,index)=>[point.id,next.points[index]!.id]));
  next.segments=next.segments.map(segment=>({...segment,id:crypto.randomUUID(),fromPointId:idMap.get(segment.fromPointId)!,toPointId:idMap.get(segment.toPointId)!}));
  if(next.subpaths){
    const segmentMap=new Map(geometry.segments.map((segment,index)=>[segment.id,next.segments[index]!.id]));
    next.subpaths=next.subpaths.map(subpath=>({...subpath,segmentIds:subpath.segmentIds.map(id=>segmentMap.get(id)!).filter(Boolean)}));
  }
  return next;
}

function mirroredElement(source:DesignElement,artboardWidthMm:number,artboardHeightMm:number,axis:MirrorAxis,newId:string,newGroupId?:string):DesignElement {
  const next=clone(source) as DesignElement;
  next.id=newId;
  next.name=`${source.name} Mirror`;
  next.groupId=newGroupId;
  next.position={
    xMm:axis==='VERTICAL'?artboardWidthMm-(source.position.xMm+source.size.widthMm):source.position.xMm,
    yMm:axis==='HORIZONTAL'?artboardHeightMm-(source.position.yMm+source.size.heightMm):source.position.yMm,
  };
  next.rotationDeg=-source.rotationDeg;

  if(next.type==='SHAPE'){
    if(axis==='VERTICAL') next.flipX=!next.flipX;
    else next.flipY=!next.flipY;
  }else if(next.type==='PATH'){
    next.geometry=reflectPathGeometry((source as PathDesignElement).geometry,source.size.widthMm,source.size.heightMm,axis);
  }else if(next.type==='IMAGE'){
    if(axis==='VERTICAL') next.flipX=!next.flipX;
    else next.flipY=!next.flipY;
  }else if(next.type==='SVG'){
    if(axis==='VERTICAL') next.flipX=!next.flipX;
    else next.flipY=!next.flipY;
  }
  // TEXT, QR and BARCODE intentionally remain readable/scannable: only placement/rotation are reflected.
  return next;
}

export function mirrorElementsAcrossArtboard(template:DesignTemplate,artboardId:string,elementIds:readonly string[],axis:MirrorAxis):DesignTemplate {
  const selected=new Set(elementIds);
  return {
    ...template,
    artboards:template.artboards.map(artboard=>{
      if(artboard.id!==artboardId)return artboard;
      const source=artboard.elements.filter(element=>selected.has(element.id)&&!element.locked);
      if(!source.length)return artboard;

      const usedGroupIds=new Set(source.map(element=>element.groupId).filter((id):id is string=>Boolean(id)));
      const groupMap=new Map<string,string>();
      usedGroupIds.forEach(id=>groupMap.set(id,crypto.randomUUID()));

      const elementIdMap=new Map<string,string>();
      source.forEach(element=>elementIdMap.set(element.id,crypto.randomUUID()));

      const mirrored=source.map(element=>mirroredElement(
        element,
        artboard.widthMm,
        artboard.heightMm,
        axis,
        elementIdMap.get(element.id)!,
        element.groupId?groupMap.get(element.groupId):undefined
      ));

      const mirroredGroups=artboard.groups
        .filter(group=>usedGroupIds.has(group.id))
        .map(group=>({
          ...clone(group),
          id:groupMap.get(group.id)!,
          name:`${group.name} Mirror`,
          parentGroupId:group.parentGroupId?groupMap.get(group.parentGroupId):undefined,
          elementIds:group.elementIds.map(id=>elementIdMap.get(id)).filter((id):id is string=>Boolean(id)),
        }))
        .filter(group=>group.elementIds.length>0);

      const sourceIndexes=source.map(element=>artboard.elements.findIndex(candidate=>candidate.id===element.id)).filter(index=>index>=0);
      const insertAt=sourceIndexes.length?Math.max(...sourceIndexes)+1:artboard.elements.length;
      const elements=[...artboard.elements];
      elements.splice(insertAt,0,...mirrored);
      return {...artboard,elements,groups:[...artboard.groups,...mirroredGroups]};
    })
  };
}
