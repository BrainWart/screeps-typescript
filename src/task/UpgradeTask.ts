import { Logger } from "utils/logging/Logger";
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

      if (creep.pos.isNearTo(source)) {
        creep.pickup(source);
      } else if (creep.fatigue === 0) {
        creep.moveTo(source);
      }
    }
  }

  public body(energyAvailable: number) {
    if (energyAvailable < 300) {
      return [];
    }

    return [WORK, CARRY, CARRY, MOVE, MOVE];
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    return (
      spawn.spawnCreep(body, potentialCreepName, {
        memory: { task: { task: "upgrade", room: room.name, working: false } }
      }) === OK
    );
  }
}
