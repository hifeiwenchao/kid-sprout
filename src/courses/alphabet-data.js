const letter = (id, word, translation, emoji, hint) => ({
  id,
  uppercase: id,
  lowercase: id.toLowerCase(),
  word,
  translation,
  emoji,
  hint,
});

export const ALPHABET = [
  letter('A', 'Apple', '苹果', '🍎', '大写 A 像一座小山，小写 a 有圆圆的肚子。'),
  letter('B', 'Bear', '小熊', '🐻', '大写 B 挺直腰，两个圆肚子上下排；小写 b 只有一个圆肚子。'),
  letter('C', 'Cat', '小猫', '🐱', 'C 和 c 都像张开的小嘴，大写高一点，小写矮一点。'),
  letter('D', 'Dog', '小狗', '🐶', '大写 D 像一扇圆门，小写 d 的小肚子在左边。'),
  letter('E', 'Elephant', '大象', '🐘', '大写 E 有三条横线，小写 e 像带小横线的圆圈。'),
  letter('F', 'Fish', '小鱼', '🐟', '大写 F 有两条横线，小写 f 弯弯头、伸长脚。'),
  letter('G', 'Grape', '葡萄', '🍇', '大写 G 像 C 加一小横，小写 g 的小尾巴往下弯。'),
  letter('H', 'House', '房子', '🏠', '大写 H 像小梯子，小写 h 像一把高背椅。'),
  letter('I', 'Ice', '冰块', '🧊', '大写 I 站得直直的，小写 i 头上有一颗小圆点。'),
  letter('J', 'Juice', '果汁', '🧃', 'J 和 j 的小脚都往左弯，小写 j 头上还有小圆点。'),
  letter('K', 'Kite', '风筝', '🪁', 'K 和 k 都伸出两条斜线，像一只张开的小手。'),
  letter('L', 'Lion', '狮子', '🦁', '大写 L 像个小拐角，小写 l 是一条高高的直线。'),
  letter('M', 'Moon', '月亮', '🌙', '大写 M 像两座山，小写 m 像两扇挨着的小拱门。'),
  letter('N', 'Nest', '鸟窝', '🪺', '大写 N 的中间有一条斜线，小写 n 只有一扇小拱门。'),
  letter('O', 'Orange', '橙子', '🍊', 'O 和 o 都是圆圈，圆圆大圈、圆圆小圈。'),
  letter('P', 'Panda', '熊猫', '🐼', '大写 P 的小肚子在右上方，小写 p 的长脚伸到下面。'),
  letter('Q', 'Queen', '女王', '👑', '大写 Q 是圆圈加短尾巴，小写 q 的长脚在右边。'),
  letter('R', 'Rabbit', '小兔', '🐰', '大写 R 比 P 多一条斜腿，小写 r 像冒出一枝小芽。'),
  letter('S', 'Sun', '太阳', '☀️', 'S 和 s 都弯弯的，像一条快乐扭动的小蛇。'),
  letter('T', 'Tiger', '老虎', '🐯', '大写 T 像一把小雨伞，小写 t 的横线在腰上。'),
  letter('U', 'Umbrella', '雨伞', '☂️', 'U 和 u 都像小杯子，注意小写 u 右边的小尾巴。'),
  letter('V', 'Violin', '小提琴', '🎻', 'V 和 v 都像尖尖的山谷，两条斜线在下面碰头。'),
  letter('W', 'Whale', '鲸鱼', '🐳', 'W 和 w 像两个 V 手拉手，沿着山谷走一走。'),
  letter('X', 'Xylophone', '木琴', '🎶', 'X 和 x 都是两条斜线交叉，像打招呼的两只手。'),
  letter('Y', 'Yogurt', '酸奶', '🥣', '大写 Y 像小树杈，小写 y 的一条小腿往下伸。'),
  letter('Z', 'Zebra', '斑马', '🦓', 'Z 和 z 像一条滑梯：横着走，斜着滑，再横着走。'),
];

export const ALPHABET_PROGRESS_IDS = ALPHABET.map(item => item.id);

export const ALPHABET_GROUPS = [
  { id: 'a-f', label: 'A – F', letters: ['A', 'B', 'C', 'D', 'E', 'F'] },
  { id: 'g-l', label: 'G – L', letters: ['G', 'H', 'I', 'J', 'K', 'L'] },
  { id: 'm-r', label: 'M – R', letters: ['M', 'N', 'O', 'P', 'Q', 'R'] },
  { id: 's-z', label: 'S – Z', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] },
];

export function getAlphabetLesson(learned, id) {
  return (id === undefined
    ? ALPHABET.find(item => !learned.has(item.id))
    : ALPHABET.find(item => item.id === String(id).toUpperCase())) || ALPHABET[0];
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createAlphabetRounds(type, random = Math.random) {
  if (!['match', 'listen', 'order'].includes(type)) throw new RangeError(`Unknown alphabet game: ${type}`);
  const remaining = [...ALPHABET_PROGRESS_IDS];
  return Array.from({ length: 5 }, () => {
    const target = remaining.splice(Math.floor(random() * remaining.length), 1)[0];
    const answer = type === 'match' ? target.toLowerCase() : target;
    const alternatives = shuffle(ALPHABET_PROGRESS_IDS.filter(id => id !== target), random).slice(0, 3);
    const choices = shuffle([target, ...alternatives], random).map(id => type === 'match' ? id.toLowerCase() : id);
    const round = { target, answer, choices };
    if (type === 'order') {
      const targetIndex = ALPHABET_PROGRESS_IDS.indexOf(target);
      const start = Math.max(0, Math.min(22, targetIndex - Math.floor(random() * 4)));
      round.sequence = ALPHABET_PROGRESS_IDS.slice(start, start + 4).map(id => id === target ? null : id);
    }
    return round;
  });
}

export function createAlphabetSession(rounds) {
  if (!rounds.length) throw new RangeError('An alphabet session needs at least one round');
  let index = 0;
  let solved = false;
  let completed = false;
  return {
    get current() { return rounds[index]; },
    get roundNumber() { return index + 1; },
    get solved() { return solved; },
    get completed() { return completed; },
    submit(answer) {
      if (solved || completed) return 'ignored';
      if (answer !== rounds[index].answer) return 'retry';
      solved = true;
      return 'correct';
    },
    advance() {
      if (!solved || completed) return 'ignored';
      if (index === rounds.length - 1) {
        completed = true;
        return 'complete';
      }
      index++;
      solved = false;
      return 'next';
    },
  };
}
