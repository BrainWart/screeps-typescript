import { Logger } from "utils/logging/Logger";
import { takeUntil } from "utils/Utility";
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
  private *bodyGen(): IterableIterator<BodyPartConstant> {
    yield TOUGH;
    yield TOUGH;
    yield TOUGH;
    yield MOVE;
    yield ATTACK;
    yield MOVE;
    yield MOVE;
    for (let i = 6; i < 12; i++) {
      yield ATTACK;
      yield MOVE;
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 300) {
      return [];
    }

    return takeUntil(this.bodyGen(), (parts) => _.sum(parts, (part) => BODYPART_COST[part]) > energyAvailable);
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    const ret = spawn.spawnCreep(body, potentialCreepName, {
      memory: { task: { task: "attack", room: room.name } }
    });
    this.logger.logInfo(String(ret) + "  " + String(_.sum(body, (part) => BODYPART_COST[part])));
    return ret === OK;
  }
}
