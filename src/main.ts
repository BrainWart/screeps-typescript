import { ErrorMapper } from "utils/ErrorMapper";
import { Logger } from "utils/logging/Logger";
import { Timer } from "utils/Timer";
import { Version } from "utils/Version";

const logger = new Logger("MAIN");

logger.logError(`START - ${Version.name} - ${Version.string}`);

export const loop = ErrorMapper.wrapLoop(() => Timer.log(logger, () => {
  Logger.level = Memory.logLevel;


}));
