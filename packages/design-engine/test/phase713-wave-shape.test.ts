import {describe,expect,it} from 'vitest';
import {shapeToPathGeometry} from '../src/index.js';

describe('Wave shape',()=>{
  it('creates a closed editable curved geometry',()=>{
    const geometry=shapeToPathGeometry('WAVE',{widthMm:40,heightMm:20});
    expect(geometry.closed).toBe(true);
    expect(geometry.points).toHaveLength(6);
    expect(geometry.segments.filter(segment=>segment.type==='CUBIC_BEZIER')).toHaveLength(4);
  });
});
