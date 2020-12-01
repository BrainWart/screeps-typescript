import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";

export class AttackTask extends Task<AttackMemory> {
  constructor(logger: Logger) {
    super("attack", logger);
  }

  private getEnemy(room: Room): Creep {
    const enemies = _.filter([...room.find(FIND_HOSTILE_CREEPS)], (creep) => {
      return _.min(_.map(room.find(FIND_MY_STRUCTURES), (s) => creep.pos.getRangeTo(s))) < 15;
    });

    return _.first(enemies);
  }

  public act(creep: Creep, memory: AttackMemory): void {
    const toKill = this.getEnemy(Game.rooms[memory.room]);

    if (toKill) {
      if (creep.pos.isNearTo(toKill)) {
        creep.attack(toKill);
      } else if (creep.fatigue === 0) {
        creep.moveTo(toKill, { range: 1, ignoreCreeps: false });
      }
    } else {
      if ("camp" in Game.flags) {
        if (creep.pos.inRangeTo(Game.flags.camp.pos, 3)) {
          this.logger.logInfo(creep.id + " good chance to heal others");
        } else {
          creep.moveTo(Game.flags.camp.pos, { range: 3, ignoreCreeps: false });
        }
      }
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 300) {
      return [];
    }

    return [TOUGH, TOUGH, TOUGH, ATTACK, MOVE, MOVE];
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    return (
      spawn.spawnCreep(body, potentialCreepName, {
        memory: { task: { task: "attack", room: room.name } }
      }) === OK
    );
  }
}
