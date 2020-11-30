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
    roomLogger.logInfo("logging for room " + roomName);
  }

  for (const creepName in Memory.creeps) {
    const creepLogger = logger.scoped(creepName, { room: Game.creeps[creepName].room.name });

    creepLogger.logInfo("logging for creep " + creepName + " " + Game.creeps[creepName].id);
  }
}));
