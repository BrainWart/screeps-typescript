export class Harvest {
  constructor(private creep: Creep, private memory: HarvestMemory) { }

  public act() {
    const source = Game.getObjectById(this.memory.source);

    if (source) {
      if (this.creep.pos.isNearTo(source)) {
        this.creep.harvest(source);
      } else if (this.creep.fatigue === 0) {
        this.creep.moveTo(source, { ignoreCreeps: true });
      }
    }
  }
}
