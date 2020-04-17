export function nameof<T>(key: keyof T, instance?: T): keyof T {
  return key;
}

export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};
