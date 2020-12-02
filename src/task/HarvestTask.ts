import { Logger } from "utils/logging/Logger";
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

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 250) {
      return [];
    }

    return [...Array(Math.min(5, Math.floor((energyAvailable - 50) / 100))).fill(WORK), MOVE];
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
            if (room.energyCapacityAvailable < 550) {
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
