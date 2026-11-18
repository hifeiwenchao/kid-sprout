import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { buildCurriculum, buildActivities, buildIllustrations } from '../scripts/export-native-content.mjs';

test('every referenced offline image exists and has the expected PNG dimensions', async () => {
  const curriculum = buildCurriculum();
  const referenced = new Set([
    'number_garden', 'train_engine', 'rabbit', 'bear', 'cookie',
    ...curriculum.numbers.map(item => item.motifAsset),
    ...curriculum.memoryScenes.flatMap(scene => scene.frames),
    ...curriculum.tracingTemplates.map(item => item.asset),
    ...buildActivities().games.flatMap(game => game.sets.flat()).map(round => round.item).filter(item => item?.startsWith('number_motif_')),
  ]);
  const directory = new URL('../native/shared/illustrations/', import.meta.url);
  const filenames = await readdir(directory);
  assert.equal(filenames.length, 317);
  for (const name of referenced) {
    const png = await readFile(new URL(`${name}.png`, directory));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name);
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.ok(width > 0 && height > 0, name);
    if (name.startsWith('guide_')) assert.deepEqual([width, height], [1000, 700], name);
    if (name.startsWith('memory_')) assert.deepEqual([width, height], [960, 540], name);
  }
  for (const scene of curriculum.memoryScenes) {
    const frames = await Promise.all(scene.frames.map(name => readFile(new URL(`${name}.png`, directory))));
    assert.equal(new Set(frames.map(frame => frame.toString('base64'))).size, 3, scene.title);
  }
});

test('PNG and JSON resources regenerate byte-for-byte without fonts or a browser', async () => {
  const assets = await buildIllustrations();
  assert.equal(assets.size, 317);
  for (const [name, png] of assets) {
    const committed = await readFile(new URL(`../native/shared/illustrations/${name}.png`, import.meta.url));
    assert.ok(png.equals(committed), `${name} must be regenerated with npm run native:content`);
  }
  const activities = await readFile(new URL('../native/shared/activities.json', import.meta.url), 'utf8');
  assert.equal(activities, `${JSON.stringify(buildActivities(), null, 2)}\n`);
});
