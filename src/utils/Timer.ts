export class Timer {
  public static measure(func: () => void): number {
    const startTime = Game.cpu.getUsed();
    func();
    return Game.cpu.getUsed() - startTime;
  }

  private timeStorage: { [key: string]: { count: number; total: number } };

  constructor() {
    this.timeStorage = {};
  }

  public recordTime(id: string, func: () => void): void {
    if (!(id in this.timeStorage)) {
      this.timeStorage[id] = { count: 0, total: 0 };
    }

    this.timeStorage[id].count++;
    this.timeStorage[id].total += Timer.measure(func);
  }

  public clearTime(id: string) {
    if (id in this.timeStorage) {
      delete this.timeStorage[id];
    }
  }

  public summary(): { [key: string]: { count: number; total: number } } {
    return _.cloneDeep(this.timeStorage);
  }
}
