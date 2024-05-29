import { ErrorMapper } from "utils/ErrorMapper";
import { Logger } from "utils/logging/Logger";
import { Timer } from "utils/Timer";
import { average } from "utils/Utility";
import { Version } from "utils/Version";
import { logger as globalLogger } from "./utils/Log";
import { RoomHandler } from "room/RoomHandler";
import { CreepHandler } from "creep/CreepHandler";

globalLogger.logCrit(`START - ${Version.version} - ${Game.shard.name}`);

if (Memory?.version?.gitDescribe !== Version.gitDescribe) {
  Memory.version = Version;
  Memory.powerCreeps = {};
  Memory.flags = {};
  Memory.spawns = {};
}

export const loop = ErrorMapper.wrapLoop(() => {
  const logger = globalLogger; //.withData({tick: Game.time});
  const cpuUsed = Timer.measure(() => {
    if (Game.cpu.bucket === 10000 && Game.shard.name !== "shardSeason") {
      Game.cpu.generatePixel();
      logger.logInfo("generated pixel");
    }

    for (const roomName in Game.rooms) {
      const roomLogger = logger.scoped(roomName, { room: roomName });
      const room = Game.rooms[roomName];

      RoomHandler(room, roomLogger);
    }

    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      const creepLogger = logger.scoped(creep.name, { room: creep.room.name });

      CreepHandler(creep, creepLogger);
    }
  });

  logger.logDebug("total cpu used: " + cpuUsed.toFixed(3));
});
