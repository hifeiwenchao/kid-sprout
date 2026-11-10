export function createActivitySession(rounds) {
  if (!rounds.length) throw new Error('At least one round is required');
  let index = 0;
  let solved = false;
  let completed = false;
  return {
    get current() { return rounds[index]; },
    get roundNumber() { return index + 1; },
    get solved() { return solved; },
    get completed() { return completed; },
    submit(value) {
      if (completed || solved) return 'ignored';
      const round = rounds[index];
      let correct;
      if (Array.isArray(round.answer)) {
        correct = Array.isArray(value) && value.length === round.answer.length
          && new Set(value).size === value.length
          && (round.mode === 'select'
            ? round.answer.every(answer => value.includes(answer))
            : round.answer.every((answer, position) => value[position] === answer));
      } else correct = value === round.answer;
      if (!correct) return 'retry';
      solved = true;
      return 'correct';
    },
    advance() {
      if (!solved || completed) return 'ignored';
      if (index === rounds.length - 1) { completed = true; return 'complete'; }
      index++;
      solved = false;
      return 'next';
    },
  };
}
