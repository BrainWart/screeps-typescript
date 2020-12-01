import { Task } from "./Task";

export class AttackTask extends Task<AttackMemory> {
  private getEnemey(room: Room): Creep {
    const enemies = _.filter([...room.find(FIND_HOSTILE_CREEPS)], (creep) => {
      return _.min(_.map(room.find(FIND_MY_STRUCTURES), (s) => creep.pos.getRangeTo(s))) < 10;
    });

    return _.first(enemies);
  }

  public act() {
    const toKill = this.getEnemey(Game.rooms[this.memory.room]);

    if (toKill) {
      if (this.creep.pos.isNearTo(toKill)) {
        this.creep.attack(toKill);
      } else if (this.creep.fatigue === 0) {
        this.creep.moveTo(toKill, { range: 1, ignoreCreeps: false });
      }
    } else {
      if ("camp" in Game.flags) {
        if (this.creep.pos.inRangeTo(Game.flags.camp.pos, 3)) {
          this.logger.logInfo(this.creep.id + " good chance to heal others");
        } else {
          this.creep.moveTo(Game.flags.camp.pos, { range: 3, ignoreCreeps: false });
        }
      }
    }
  }
}
