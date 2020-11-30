import { Build } from "task/Build";
import { Harvest } from "task/Harvest";
import { Upgrade } from "task/Upgrade";
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

    if (!room.memory || !room.memory.harvestables) {
      const harvestables = [...room.find(FIND_SOURCES), ...room.find(FIND_MINERALS)];
      roomLogger.logInfo("found harvestables " + harvestables.join(" "));
      room.memory = { harvestables: _.map(harvestables, (s) => ({ id: s.id, nextSpawn: 0 })) };
    }

    if (room.controller && room.controller.my) {
      const spawns = room.find(FIND_MY_SPAWNS);

      for (const spawn of spawns) {
        if (!spawn.spawning && room.energyAvailable === room.energyCapacityAvailable) {
          const potentialCreepName = `${roomName} ${Game.time % 9997}`;

          for (const sourceCheckInd in room.memory.harvestables) {
            const sourceCheck = room.memory.harvestables[sourceCheckInd];
            const source = Game.getObjectById(sourceCheck.id);

            if (source && sourceCheck.nextSpawn < Game.time) {
              if (source instanceof Source) {
                spawn.spawnCreep([WORK, MOVE, MOVE, WORK], potentialCreepName, { memory: { task: {task: "harvest", source: sourceCheck.id} }});
                sourceCheck.nextSpawn = Game.time + 1500;
              } else {
                const extractors = room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType === STRUCTURE_EXTRACTOR)});
                if (_.any(extractors, (ex) => source.pos.isEqualTo(ex.pos))) {
                  spawn.spawnCreep([WORK, MOVE, MOVE, WORK], potentialCreepName, { memory: { task: {task: "harvest", source: sourceCheck.id} }});
                  sourceCheck.nextSpawn = Game.time + 1500;
                }
              }
            }
          }

          const workerLimits: Record<Tasks, number> = { harvest: 0, upgrade: 3, build: 3 };
          for (const creepName in Game.creeps) {
            workerLimits[Game.creeps[creepName].memory.task.task]--;
          }

          for (const job in workerLimits) {
            if (workerLimits[job as Tasks] > 0) {
              spawn.spawnCreep([WORK, MOVE, MOVE, CARRY, CARRY], potentialCreepName, { memory: { task: {task: "upgrade", room: roomName, working: false} }});
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

    function badTask(t: never): never;
    function badTask(t: TaskMemory) { throw new Error("invalid task memory: " + t); }

    switch (creep.memory.task.task) {
      case "upgrade":
        new Upgrade(creep, creep.memory.task, logger).act();
        break;
      case "harvest":
        new Harvest(creep, creep.memory.task, logger).act();
        break;
      case "build":
        new Build(creep, creep.memory.task, logger).act();
        break
      default:
        badTask(creep.memory.task);
    }
  }
}));
