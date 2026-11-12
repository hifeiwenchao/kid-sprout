export function createFruitCounter() {
  const counted = new Set();
  return fruitId => {
    counted.add(fruitId);
    return counted.size;
  };
}
