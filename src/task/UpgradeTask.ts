import { Logger } from "utils/logging/Logger";
import { takeUntil } from "utils/Utility";
import { HarvestTask } from "./HarvestTask";
import { Task } from "./Task";

function getEnergySource(room: Room) {
  return _.max(
    [...room.find(FIND_DROPPED_RESOURCES, { filter: (resource) => resource.resourceType === RESOURCE_ENERGY })],
    (r) => r.amount
  );
}

export class UpgradeTask extends Task<UpgradeMemory> {
  constructor(logger: Logger) {
    super("upgrade", logger);
  }

  public act(creep: Creep, memory: UpgradeMemory) {
    if (creep.store.getUsedCapacity() === 0) {
      memory.working = false;
    }
    if (creep.store.getFreeCapacity() === 0) {
      memory.working = true;
    }

    if (memory.working) {
      const controller = Game.rooms[memory.room].controller;

      if (controller) {
        if (creep.pos.inRangeTo(controller, 3)) {
          creep.upgradeController(controller);
        } else if (creep.fatigue === 0) {
          creep.moveTo(controller, { range: 3, ignoreCreeps: false });
        }
      } else {
        creep.moveTo(new RoomPosition(25, 25, memory.room), { range: 15, ignoreCreeps: false });
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
      yield MOVE;
      yield WORK;
      yield CARRY;
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
        memory: { task: { task: "upgrade", room: room.name, working: false } }
      }) === OK
    );
  }
}
