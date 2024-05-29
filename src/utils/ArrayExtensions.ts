export {}
declare global {
  interface Array<T>  {
    toDictionary<K extends PropertyKey, V>(
      keySelector: (item: T) => K, valueSelector: (items: T[]) => V
    ): { [P in K]?: V };
  }
}

if (!Array.prototype.toDictionary) {
  Object.defineProperty(Array.prototype, 'toDictionary', {
    enumerable: false, 
    writable: false, 
    configurable: false, 
    value: function toDictionary<T, K extends PropertyKey, V>(
      this: T[], keySelector: (item: T) => K, valueSelector: (items: T[]) => V
    ): { [P in K]?: V } {
      var keyed = this.map(t => ({item: t, key: keySelector(t)}));
      var keys = _.unique(keyed.map(t => t.key));
      var ret : { [P in K]?: V } = {};

      for (const key of keys) {
        ret[key] = valueSelector([...keyed.filter(t => t.key === key).map(t => t.item)]);
      }

      return ret;
    }
  });
}