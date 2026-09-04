import {
  createBlankArtboard,
  resolveTargetArtboards,
  pairArtboards,
  unpairArtboard,
  createBackSide,
  setArtboardRole
} from './packages/design-engine/dist/index.js';
import assert from 'node:assert';

function runSmoke() {
  console.log('--- Running Phase 6.4 Multi-Artboard Smoke Test ---');
  
  let t = { artboards: [] };
  
  // 1. Create Blank
  const a1 = createBlankArtboard({ id: 'a1', widthMm: 100, heightMm: 50 });
  t.artboards.push(a1);
  
  // 2. Set Role
  t = setArtboardRole(t, 'a1', 'FRONT');
  assert.strictEqual(t.artboards[0].role, 'FRONT');
  
  // 3. Create Back Side
  t = createBackSide(t, 'a1', 'a2', 'pair1');
  assert.strictEqual(t.artboards.length, 2);
  assert.strictEqual(t.artboards[1].role, 'BACK');
  assert.strictEqual(t.artboards[0].pairId, 'pair1');
  assert.strictEqual(t.artboards[1].pairId, 'pair1');
  
  // 4. Resolve Targets
  let targets = resolveTargetArtboards(t, 'CURRENT', 'a1', []);
  assert.strictEqual(targets.length, 1);
  assert.strictEqual(targets[0].id, 'a1');
  
  targets = resolveTargetArtboards(t, 'SELECTED', 'a1', ['a1', 'a2']);
  assert.strictEqual(targets.length, 2);
  
  // 5. Unpair
  t = unpairArtboard(t, 'a1');
  assert.strictEqual(t.artboards[0].pairId, undefined);
  assert.strictEqual(t.artboards[1].pairId, undefined);
  assert.strictEqual(t.artboards[0].role, 'GENERIC');
  assert.strictEqual(t.artboards[1].role, 'GENERIC');

  console.log('Smoke test passed.');
}

runSmoke();
