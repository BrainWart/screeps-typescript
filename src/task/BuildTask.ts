import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";
import { UpgradeTask } from "./UpgradeTask";

function getEnergySource(room: Room): Resource<ResourceConstant> {
  return _.max(
    [
      ...room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount > 30
      })
    ],
    (r) => r.amount
  );
}

function getBuildable(room: Room): ConstructionSite<BuildableStructureConstant> {
  return _.first([...room.find(FIND_MY_CONSTRUCTION_SITES)]);
}

export class BuildTask extends Task<BuildMemory> {
  constructor(logger: Logger) {
    super("build", logger);
  }

  public act(creep: Creep, memory: BuildMemory) {
    if (creep.store.getUsedCapacity() === 0) {
      memory.working = false;
    }
    if (creep.store.getFreeCapacity() === 0) {
      memory.working = true;
    }

    if (memory.working) {
      const toBuild = getBuildable(Game.rooms[memory.room]);

      if (toBuild) {
        if (creep.pos.inRangeTo(toBuild, 3)) {
          creep.build(toBuild);
        } else if (creep.fatigue === 0) {
          creep.moveTo(toBuild, { range: 3, ignoreCreeps: false });
        }
      } else {
        new UpgradeTask(this.logger).act(creep, { ...memory, ...{ task: "upgrade" } });
      }
    } else {
      const source = getEnergySource(creep.room);

      if (source) {
        if (creep.pos.isNearTo(source)) {
          creep.pickup(source);
        } else if (creep.fatigue === 0) {
          creep.moveTo(source);
        }
      } else {
        memory.working = true;
      }
    }
  }

  public body(energyAvailable: number) {
    if (energyAvailable < 300) {
      return [];
    }

    return [WORK, WORK, CARRY, MOVE];
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): void {
    spawn.spawnCreep(body, potentialCreepName, {
      memory: { task: { task: "build", room: room.name, working: false } }
    });
  }
}
