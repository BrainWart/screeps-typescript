import { Task } from "./Task";

export class HarvestTask extends Task<HarvestMemory> {
  public act() {
    const source = Game.getObjectById(this.memory.source);

    if (source) {
      if (this.creep.pos.isNearTo(source)) {
        this.creep.harvest(source);
      } else if (this.creep.fatigue === 0) {
        this.creep.moveTo(source, { ignoreCreeps: false });
      }
    }
  }
}
