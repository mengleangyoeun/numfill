export interface RandomGeneratorOptions {
  min: number;
  max: number;
  count: number;
  unique?: boolean;
}

/**
 * Generates a list of random integer numbers within [min, max] (inclusive).
 * Supports unique mode if range is large enough.
 */
export function generateRandomNumbers(options: RandomGeneratorOptions): number[] {
  let { min, max, count } = options;
  const unique = options.unique ?? false;

  // Sanitize inputs
  min = Math.floor(Number(min) || 0);
  max = Math.floor(Number(max) || 0);
  count = Math.max(1, Math.floor(Number(count) || 1));

  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
  }

  const rangeSize = max - min + 1;
  const results: number[] = [];

  if (unique && count <= rangeSize) {
    const used = new Set<number>();
    while (results.length < count) {
      const rand = Math.floor(Math.random() * rangeSize) + min;
      if (!used.has(rand)) {
        used.add(rand);
        results.push(rand);
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      const rand = Math.floor(Math.random() * rangeSize) + min;
      results.push(rand);
    }
  }

  return results;
}
