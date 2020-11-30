import { logger } from "utils/Log";
import { BuildTask } from "./BuildTask";
import { Task } from "./Task";

function getEnemy(room: Room): Creep {
  return _.first([
    ...room.find(FIND_HOSTILE_CREEPS),
  ]);
}

export class AttackTask extends Task<AttackMemory> {
  public act() {
      const toKill = getEnemy(Game.rooms[this.memory.room]);

      if (toKill) {
        if (this.creep.pos.isNearTo(toKill)) {
            this.creep.attack(toKill);
        } else if (this.creep.fatigue === 0) {
          this.creep.moveTo(toKill, { range: 1, ignoreCreeps: false });
        }
      } else {
        logger.logAlert("halp");
      }

  }
}
