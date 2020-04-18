import { JobManager } from "managers/JobManager";
import { Manager } from "managers/Manager";
import { RoomManager } from "managers/RoomManager";
import { ErrorMapper } from "utils/ErrorMapper";
import { Logger, LogLevel } from "utils/Logger";
import { Timer } from "utils/Timer";
import pack from "../package.json";

const versionParts = _.flatten(_.map(pack.version.split("+"), (part) => part.split(".")));
const version = {
  branch: versionParts[3],
  major: versionParts[0],
  minor: versionParts[1],
  patch: versionParts[2],
  revision: versionParts[4]
};

const logger = new Logger("MAIN");

logger.logError(`START - ${pack.name} - ${pack.version}`);

if (Memory.version.major !== version.major || Memory.version.branch === "dev") {
  logger.logWarning("Clearing memory");
  for (const index in Memory) {
    delete Memory[index];
  }

  logger.logTrace1("Setting built-in memory to objects");
  Memory.version = version;
  Memory.creeps = {};
  Memory.flags = {};
  Memory.powerCreeps = {};
  Memory.rooms = {};
  Memory.spawns = {};
}

export const loop = ErrorMapper.wrapLoop(() =>
  Timer.log(logger, () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];

      const roomManager = Manager.GetManager(RoomManager, room);
      const jobManager = Manager.GetManager(JobManager, room);
      jobManager.CheckJobs();
    }
  })
);
