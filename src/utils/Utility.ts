export function nameof<T>(key: keyof T, instance?: T): keyof T {
  return key;
}

export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export function takeUntil<T>(iter: IterableIterator<T>, test: (currentList: T[]) => boolean): T[] {
  const taken: T[] = [];

  for (const obj of iter) {
    taken.push(obj);

    if (test(taken)) {
      break;
    }
  }

  taken.pop();

  return taken;
}

export function average<T>(n: T[], iter: (item: T) => number = (x) => Number(x)): number {
  return _.sum(n, iter) / n.length;
}
