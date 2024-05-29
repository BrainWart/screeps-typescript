import { Logger } from "utils/logging/Logger";
import { takeUntil } from "utils/Utility";
import { Task } from "./Task";

export class HarvestTask extends Task<HarvestMemory> {
  constructor(logger: Logger) {
    super("harvest", logger);
  }

  public act(creep: Creep, memory: HarvestMemory): void {
    const source = Game.getObjectById(memory.source);

    if (source) {
      if (creep.pos.isNearTo(source)) {
        creep.harvest(source);
      } else if (creep.fatigue === 0) {
        creep.moveTo(source, { ignoreCreeps: false });
      }
    }
  }

  private *bodyGen(): IterableIterator<BodyPartConstant> {
    yield MOVE;
    yield WORK;
    yield WORK;
    yield WORK;
    yield WORK;
    yield WORK;
    yield MOVE;
    yield MOVE;
    yield MOVE;
    yield MOVE;
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 250) {
      return [];
    }

    return takeUntil(this.bodyGen(), (parts) => _.sum(parts, (part) => BODYPART_COST[part]) >= energyAvailable);
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    for (const sourceCheckInd in room.memory.harvestables) {
      const sourceCheck = room.memory.harvestables[sourceCheckInd];
      const source = Game.getObjectById(sourceCheck.id);

      if (source && sourceCheck.nextSpawn < Game.time) {
        if (source instanceof Source) {
          if (
            spawn.spawnCreep(body, potentialCreepName, {
              memory: { task: { task: "harvest", source: sourceCheck.id } }
            }) === OK
          ) {
            if (body.length < 6) {
              sourceCheck.nextSpawn = Game.time + 750;
            } else {
              sourceCheck.nextSpawn = Game.time + 1500;
            }
            return true;
          }
        } else {
          const extractors = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_EXTRACTOR
          });
          if (_.any(extractors, (ex) => source.pos.isEqualTo(ex.pos))) {
            if (
              spawn.spawnCreep(body, potentialCreepName, {
                memory: { task: { task: "harvest", source: sourceCheck.id } }
              }) === OK
            ) {
              sourceCheck.nextSpawn = Game.time + 1500;
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}
