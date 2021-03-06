import { Logger } from "utils/logging/Logger";
import { takeUntil } from "utils/Utility";
import { HarvestTask } from "./HarvestTask";
import { Task } from "./Task";
import { UpgradeTask } from "./UpgradeTask";

function getEnergySource(from: RoomPosition, room: Room): Resource<ResourceConstant> {
  return _.max(
    [
      ...room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.amount > 30
      })
    ],
    (r) => r.amount - 30 * from.getRangeTo(r)
  );
}

const buildPriortyRecord: Record<BuildableStructureConstant, number> = {
  constructedWall: 6,
  container: 1,
  extension: 0,
  extractor: 1,
  factory: 1,
  lab: 1,
  link: 1,
  nuker: 1,
  observer: 1,
  powerSpawn: 1,
  rampart: 1,
  road: 50,
  spawn: 0,
  storage: 1,
  terminal: 10,
  tower: 0
};

function getBuildable(room: Room): ConstructionSite<BuildableStructureConstant> {
  return _.first(_.sortBy(room.find(FIND_MY_CONSTRUCTION_SITES), (cs) => buildPriortyRecord[cs.structureType]));
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
      const source = getEnergySource(creep.pos, creep.room);

      if (source) {
        if (creep.pos.isNearTo(source)) {
          creep.pickup(source);
        } else if (creep.fatigue === 0) {
          creep.moveTo(source);
        }
      } else {
        const toMine = _.first(_.sortBy(creep.room.find(FIND_SOURCES), (s) => s.pos.getRangeTo(creep)));
        if (toMine) {
          new HarvestTask(this.logger).act(creep, { task: "harvest", source: toMine.id });
        }
      }
    }
  }

  private *bodyGen(): IterableIterator<BodyPartConstant> {
    yield WORK;
    yield WORK;
    yield CARRY;
    yield MOVE;
    yield MOVE;
    yield CARRY;

    for (let i = 6; i < MAX_CREEP_SIZE; i++) {
      yield MOVE;
      yield WORK;
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 300) {
      return [];
    }

    return takeUntil(this.bodyGen(), (parts) => _.sum(parts, (part) => BODYPART_COST[part]) > energyAvailable);
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    return (
      spawn.spawnCreep(body, potentialCreepName, {
        memory: { task: { task: "build", room: room.name, working: false } }
      }) === OK
    );
  }
}
