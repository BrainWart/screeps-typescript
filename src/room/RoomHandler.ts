import { Logger } from "utils/logging/Logger";
import { Version } from "utils/Version";

export function RoomHandler(room: Room, logger: Logger) {
  if (!room.memory || room.memory.version !== Version.gitDescribe) {
    room.memory = {
      ...{
        constructedForLevel: -1,
        tasks: [],
      },
      ...room.memory,
      version: Version.gitDescribe,
    };
  }

  for (const task of room.memory.tasks) {
    if (task.creeps.length > 0) {
      task.creeps = [...task.creeps.filter(creepId => Game.getObjectById(creepId))]
    }
  }

  if (
    _.any(room.find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax })) ||
    (room.controller && room.controller.ticksToDowngrade < 3000)
  ) {
    logger.logAlert("room has been damaged. enabling safe-mode");
  }

  for (const source of room.find(FIND_SOURCES)) {
    const sourceTask = room.memory.tasks.find(t => t.id == source.id);
    if (!sourceTask) {
      room.memory.tasks.push({
        action: "harvest",
        id: source.id,
        maxCreeps: 1,
        creeps: [],
      });
      logger.logInfo(`creating task harvest for ${source}`)
    }
  }
  
  for (const mineral of room.find(FIND_MINERALS)) {
    const mineralTask = room.memory.tasks.find(t => t.id == mineral.id);
    if (!mineralTask && room.lookForAt(LOOK_STRUCTURES, mineral.pos).find(x => x.structureType === STRUCTURE_EXTRACTOR)) {
      room.memory.tasks.push({
        action: "harvest",
        id: mineral.id,
        maxCreeps: 1,
        creeps: []
      })
      logger.logInfo(`creating task harvest for ${mineral}`)
    }
  }

  if (room.controller?.my) {
    const controllerTask = room.memory.tasks.find(t => t.id == room.controller?.id);
    if (!controllerTask) {
      room.memory.tasks.push({
        action: "upgrade",
        id: room.controller.id,
        creeps: []
      })
      logger.logInfo(`creating task upgrade for ${room.controller}`)
    }
  }

  for (const spawn of room.find(FIND_MY_SPAWNS)) {
    if (room.energyAvailable === room.energyCapacityAvailable) {
      spawn.spawnCreep([MOVE, MOVE, CARRY, WORK], `${Game.time}`, {
        memory: {
          version: Version.gitDescribe,
        }
      });
    }
  }
}