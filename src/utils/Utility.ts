export function nameof<T>(key: keyof T, instance?: T): keyof T {
  return key;
}

export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export function take<T>(iter: IterableIterator<T>, n: number = 1): T[] {
  return takeWhile(iter, (list) => list.length < n);
}

export function takeWhile<T>(iter: IterableIterator<T>, test: (currentList: T[]) => boolean): T[] {
  const taken: T[] = [];

  for (const obj of iter) {
    taken.push(obj);

    if (!test(taken)) {
      break;
    }
  }

  return taken;
}
