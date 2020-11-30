import { Task } from "task/Task";
import { ErrorMapper } from "utils/ErrorMapper";
import { Timer } from "utils/Timer";
import { Version } from "utils/Version";
import { logger } from "./utils/Log";

logger.logAlert(`START - ${Version.name} - ${Version.string} - ${Game.shard.name}`);

export const loop = ErrorMapper.wrapLoop(() => Timer.log(logger, () => {
  if (Game.cpu.bucket === 10000) {
    Game.cpu.generatePixel();
    logger.logInfo("generated pixel");
  }

  for (const roomName in Game.rooms) {
    const roomLogger = logger.scoped(roomName, { room: roomName });
    const room = Game.rooms[roomName];

    if (!!room.memory) {
      const harvestables = [...room.find(FIND_SOURCES), ...room.find(FIND_MINERALS)];
      room.memory = { harvestables: _.map(harvestables, (s) => ({ id: s.id, nextSpawn: 0 })) };
    }

    if (room.controller && room.controller.my) {
      const spawns = room.find(FIND_MY_SPAWNS);

      for (const spawn of spawns) {
        if (!spawn.spawning && room.energyAvailable === room.energyCapacityAvailable) {
          for (const sourceCheck of room.memory.harvestables) {
            if (sourceCheck.nextSpawn < Game.time) {
              spawn.spawnCreep([WORK, MOVE, MOVE, WORK], `${roomName}${Game.time % 9997}`, { memory: { tasks: [ {task: "harvest", source: sourceCheck.id} ] }});
              sourceCheck.nextSpawn = Game.time + 1500;
            }
          }
        }
      }
    }
  }

  for (const creepName in Memory.creeps) {
    const creepLogger = logger.scoped(creepName);
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName];
      creepLogger.logDebug("removing memory");
      continue;
    }
    creepLogger.data = { ...creepLogger.data, ...{ room: Game.creeps[creepName].room.name }};

    const creep = Game.creeps[creepName];

    Task.forCreep(creep);
  }
}));
