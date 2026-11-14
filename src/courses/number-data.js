export const NUMBER_VALUES = Object.freeze(Array.from({ length: 11 }, (_, index) => index));
const NUMBER_NAMES = Object.freeze(['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']);

export const numberName = number => NUMBER_NAMES[number] ?? '';

export function restoreNumberProgress(values) {
  return new Set((Array.isArray(values) ? values : []).filter(value => Number.isInteger(value) && NUMBER_VALUES.includes(value)));
}

export function nextNumberToLearn(learned) {
  return NUMBER_VALUES.find(number => !learned.has(number));
}

export function zeroBasketExample(hasApple) {
  return hasApple
    ? { count: 1, explanation: '篮子里有 1 个苹果。拿走它，再看看还剩几个？', action: '拿走苹果', speech: '篮子里有一个苹果，用数字一表示。把苹果拿走，再看看吧。' }
    : { count: 0, explanation: '一个苹果也没有啦！一个也没有，可以用 0 表示。', action: '放入 1 个苹果', speech: '零，一个也没有，用零表示。篮子里有零个苹果。' };
}
