import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { NUMBER_VALUES, numberName } from '../src/courses/number-data.js';
import { PINYIN_ITEMS, PINYIN_LESSONS, PINYIN_SOURCES, PINYIN_TONES } from '../src/courses/pinyin-data.js';
import { ALPHABET, ALPHABET_GROUPS } from '../src/courses/alphabet-data.js';
import { NUMBER_MEMORY_SCENES } from '../src/courses/number-memory.js';
import { ALPHABET_MEMORY_SCENES } from '../src/courses/alphabet-memory.js';
import { getPinyinMemory, getToneMemory } from '../src/courses/pinyin-memory.js';
import { TRACING_GROUPS, getTracingTemplate } from '../src/drawing-tracing.js';
import { buildActivities } from './native-activities.mjs';

export { buildActivities } from './native-activities.mjs';

const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
function literalStrings(name) {
  const list = mainSource.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
  if (!list) throw new Error(`Missing website artwork data: ${name}`);
  return [...list[1].matchAll(/'([^']*)'/g)].map(match => match[1]);
}
const fruits = literalStrings('fruits');
const units = literalStrings('units');
const motifs = literalStrings('motifs');
const safeSymbol = symbol => [...symbol].map(character => character.codePointAt(0).toString(16)).join('_');
const memorySources = () => [
  ...NUMBER_MEMORY_SCENES.map(scene => ({ subject: 'numbers', ...scene })),
  ...Object.keys(PINYIN_ITEMS).map(symbol => ({ subject: 'pinyin', ...getPinyinMemory(symbol) })),
  ...PINYIN_TONES.map(tone => ({ subject: 'pinyin', ...getToneMemory(tone.number) })),
  ...ALPHABET_MEMORY_SCENES.map(scene => ({ subject: 'alphabet', ...scene })),
];
const frameNames = scene => [0, 1, 2].map(stage => `memory_${scene.subject}_${safeSymbol(scene.symbol)}_${stage}`);
const tracingTemplates = () => TRACING_GROUPS.flatMap(group => group.characters.map(character => ({ id: `${group.id}:${character}`, group: group.id, label: character, asset: `guide_${group.id}_${safeSymbol(character)}` })));

// Keep the mobile bundle a plain, versioned document with no executable web code.
export function buildCurriculum() {
  return structuredClone({
    schemaVersion: 1,
    brand: '萌呀启蒙',
    numbers: NUMBER_VALUES.map(value => ({ value, name: numberName(value), motifAsset: value === 0 ? 'empty_basket' : `number_motif_${value - 1}`, fruit: value === 0 ? '苹果' : fruits[value - 1], unit: value === 0 ? '个' : units[value - 1] })),
    pinyin: {
      edition: '2024 新版人教版一年级上册',
      sources: PINYIN_SOURCES,
      lessons: PINYIN_LESSONS,
      items: Object.values(PINYIN_ITEMS),
      tones: PINYIN_TONES,
    },
    alphabet: { letters: ALPHABET, groups: ALPHABET_GROUPS },
    memoryScenes: memorySources().map(scene => ({ subject: scene.subject, symbol: scene.symbol, title: scene.title, description: scene.description, frames: frameNames(scene) })),
    tracingTemplates: tracingTemplates(),
  });
}

function memoryFrame(scene, stage) {
  // resvg has no browser CSS motion-path implementation. Place the tone car
  // explicitly at the corresponding point on the original road instead.
  const points = scene.symbol === 'ā' ? [[12, 25], [50, 25], [88, 25]]
    : scene.symbol === 'á' ? [[12, 66], [50, 44], [88, 22]]
    : scene.symbol === 'ǎ' ? [[12, 35], [45, 72], [88, 20]]
    : [[12, 22], [50, 47], [88, 72]];
  let svg = scene.art.replace(/style="offset-path:[^"]+"/g, `transform="translate(${points[stage].join(' ')})"`);
  // The source's few text labels become paths as well. No installed font can
  // change the committed images or leave a Chinese label blank on Linux.
  if (scene.subject === 'alphabet') {
    const big = 'M12 42H88 M52 12C52 59 37 79 10 94 M51 42C58 69 72 86 92 94';
    const small = 'M50 10V81Q50 95 37 87 M25 39Q19 62 9 73 M73 39Q83 57 90 72';
    const write = 'M12 10H88V32 M12 10V31 M31 31H70 M30 31L24 58H78L72 85Q70 96 53 89 M11 72H88';
    for (const [x, glyph] of [[80, big], [240, small]]) {
      svg = svg.replace(new RegExp(`<text x="${x}" y="172">[^<]*</text>`), `<g transform="translate(${x - 10} 162) scale(.1)" fill="none" stroke="#9aa38d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="${glyph}"/><path transform="translate(105 0)" d="${write}"/></g>`);
    }
  } else if (['ā', 'á', 'ǎ', 'à'].includes(scene.symbol)) {
    const a = getTracingTemplate('alphabet', 'Aa').glyphs[1].paths;
    const mark = { ā: 'M29 30H72', á: 'M35 36L67 15', ǎ: 'M27 17L49 35L74 14', à: 'M33 15L68 36' }[scene.symbol];
    const label = `<g transform="translate(145 137) scale(.3)" fill="none" stroke="#6c8b63" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${[...a, mark].map(path => `<path d="${path}"/>`).join('')}</g>`;
    svg = svg.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, label);
  }
  const styles = `<style>.memory-art-object{opacity:${[1, .85, .65][stage]}}.memory-art-shape{opacity:${[.12, .6, 1][stage]}}.memory-art-accent{opacity:${[.6, 1, .8][stage]}}</style>`;
  svg = svg.replace(/(<svg\b[^>]*>)/, `$1${styles}`);
  return svg;
}

function tracingSVG(template) {
  const width = 1000, height = 700;
  const scale = Math.min(width * .8 / template.width, height * .63 / 120);
  const left = (width - template.width * scale) / 2;
  const top = (height - 120 * scale) / 2 - 20 * scale;
  const glyphs = template.glyphs.map(glyph => `<g transform="translate(${glyph.x} 0)">${glyph.paths.map(path => `<path d="${path}" fill="none" stroke="#e9eee4" stroke-width="6"/><path d="${path}" fill="none" stroke="#b6c5a8" stroke-width=".75" stroke-dasharray="1.6 2.2"/>`).join('')}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g transform="translate(${left} ${top}) scale(${scale})" stroke-linecap="round" stroke-linejoin="round">${glyphs}</g></svg>`;
}

export async function buildIllustrations() {
  const { Resvg } = await import('@resvg/resvg-js');
  const assets = new Map();
  const add = (name, svg, width) => {
    const source = svg.includes('xmlns=') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    assets.set(name, Buffer.from(new Resvg(source, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render().asPng()));
  };
  add('number_garden', await readFile(new URL('../public/number-garden.svg', import.meta.url), 'utf8'), 1200);
  motifs.forEach((motif, index) => add(`number_motif_${index}`, `<svg viewBox="0 0 34 36">${motif}</svg>`, 204));
  const basket = mainSource.slice(mainSource.indexOf('function emptyBasket')).match(/<svg[^>]*>[\s\S]*?<\/svg>/)?.[0];
  if (!basket) throw new Error('Missing website empty basket artwork');
  add('empty_basket', basket, 336);
  for (const filename of ['number-adventures', 'bear-picnic']) {
    const source = await readFile(new URL(`../src/games/${filename}.js`, import.meta.url), 'utf8');
    for (const match of source.matchAll(/const (trainEngine|rabbit|bear|cookie) = `(<svg[\s\S]*?<\/svg>)`;/g)) add(({ trainEngine: 'train_engine', rabbit: 'rabbit', bear: 'bear', cookie: 'cookie' })[match[1]], match[2], 400);
  }
  for (const scene of memorySources()) frameNames(scene).forEach((name, stage) => add(name, memoryFrame(scene, stage), 960));
  for (const template of tracingTemplates()) add(template.asset, tracingSVG(getTracingTemplate(template.group, template.label)), 1000);
  return assets;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const directory = new URL('../native/shared/', import.meta.url);
  const files = new Map([
    ['curriculum.json', Buffer.from(`${JSON.stringify(buildCurriculum(), null, 2)}\n`)],
    ['activities.json', Buffer.from(`${JSON.stringify(buildActivities(), null, 2)}\n`)],
    ...[...await buildIllustrations()].map(([name, png]) => [`illustrations/${name}.png`, png]),
  ]);
  if (process.argv.includes('--check')) {
    const stale = [];
    for (const [name, content] of files) {
      const existing = await readFile(new URL(name, directory)).catch(() => Buffer.alloc(0));
      if (!existing.equals(content)) stale.push(name);
    }
    if (stale.length) {
      console.error(`原生资源已过期（${stale.length} 个），请运行 npm run native:content。`);
      process.exitCode = 1;
    } else {
      console.log(`原生课程、60 款游戏和 ${files.size - 2} 张插画与网页一致。`);
    }
  } else {
    await mkdir(new URL('illustrations/', directory), { recursive: true });
    for (const [name, content] of files) await writeFile(new URL(name, directory), content);
    console.log(`已生成离线课程、60 款游戏和 ${files.size - 2} 张 PNG 插画。`);
  }
}
