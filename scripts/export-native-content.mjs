import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { NUMBER_VALUES, numberName } from '../src/courses/number-data.js';
import { PINYIN_ITEMS, PINYIN_LESSONS, PINYIN_SOURCES, PINYIN_TONES } from '../src/courses/pinyin-data.js';
import { ALPHABET, ALPHABET_GROUPS } from '../src/courses/alphabet-data.js';

// Keep the mobile bundle a plain, versioned document with no executable web code.
export function buildCurriculum() {
  return structuredClone({
    schemaVersion: 1,
    brand: '萌芽启蒙',
    numbers: NUMBER_VALUES.map(value => ({ value, name: numberName(value) })),
    pinyin: {
      edition: '2024 新版人教版一年级上册',
      sources: PINYIN_SOURCES,
      lessons: PINYIN_LESSONS,
      items: Object.values(PINYIN_ITEMS),
      tones: PINYIN_TONES,
    },
    alphabet: { letters: ALPHABET, groups: ALPHABET_GROUPS },
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const target = new URL('../native/shared/curriculum.json', import.meta.url);
  const content = `${JSON.stringify(buildCurriculum(), null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const existing = await readFile(target, 'utf8').catch(() => '');
    if (existing !== content) {
      console.error('原生课程资源已过期，请运行 npm run native:content 并提交更新。');
      process.exitCode = 1;
    } else {
      console.log('原生课程资源与网页课程一致。');
    }
  } else {
    await mkdir(new URL('.', target), { recursive: true });
    await writeFile(target, content);
    console.log('已生成 native/shared/curriculum.json。');
  }
}
