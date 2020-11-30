import { ErrorMapper } from "utils/ErrorMapper";
import { FancyScreepsConsoleProvider } from "utils/FancyScreepsConsoleProvider";
import { Logger } from "utils/logging/Logger";
import { Timer } from "utils/Timer";
import { Version } from "utils/Version";

const logger = new Logger("MAIN", [ new FancyScreepsConsoleProvider() ]);

logger.logAlert(`START - ${Version.name} - ${Version.string} - ${Game.shard.name}`);

export const loop = ErrorMapper.wrapLoop(() => Timer.log(logger, () => {
  for (const roomName in Game.rooms) {
    const localLogger = logger.scoped(roomName, { shard: Game.shard.name, room: roomName });
    localLogger.logInfo("logging for room " + roomName);
  }
}));
