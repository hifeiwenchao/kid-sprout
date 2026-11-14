// History entries share immutable strokes, so undo does not duplicate every
// point in a drawing. The limit bounds undo steps without removing older art.
export function createDrawingHistory({ limit = 80 } = {}) {
  const maxUndo = Number.isInteger(limit) && limit >= 0 ? limit : 80;
  let entries = [Object.freeze([])];
  let cursor = 0;

  function commit(strokes) {
    entries = entries.slice(0, cursor + 1);
    entries.push(Object.freeze(strokes));
    if (entries.length > maxUndo + 1) entries.splice(0, entries.length - maxUndo - 1);
    cursor = entries.length - 1;
    return true;
  }

  return {
    addStroke(stroke) {
      if (!Array.isArray(stroke?.points) || stroke.points.length === 0) return false;
      const snapshot = Object.freeze({
        ...stroke,
        points: Object.freeze(stroke.points.map(point => Object.freeze({ ...point }))),
      });
      return commit([...entries[cursor], snapshot]);
    },
    clear() {
      if (entries[cursor].length === 0) return false;
      return commit([]);
    },
    undo() {
      if (cursor === 0) return false;
      cursor--;
      return true;
    },
    redo() {
      if (cursor === entries.length - 1) return false;
      cursor++;
      return true;
    },
    get strokes() { return entries[cursor]; },
    get canUndo() { return cursor > 0; },
    get canRedo() { return cursor < entries.length - 1; },
  };
}
