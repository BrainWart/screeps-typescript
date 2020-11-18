import { RoomControl } from "room/RoomControl";
import { Spawning } from "room/Spawning";
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

if (_.isUndefined(Memory.version) || Memory.version.major !== version.major || Memory.version.branch === "testing") {
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
  Memory.logLevel = Logger.level;
}

export const loop = ErrorMapper.wrapLoop(() =>
  Timer.log(logger, () => {
    Logger.level = Memory.logLevel;

    if (Game.cpu.bucket === 10_000) {
      Game.cpu.generatePixel();
    }

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];

      RoomControl.setupMemory(room);

      const tasks = RoomControl.getTasks(room);

      for (const task of tasks) {
        logger.logWarning(JSON.stringify(Spawning.fillRequirements(task, room.energyAvailable)));
      }

      room.memory.tasks = tasks;
    }

    for (const creepName in Memory.creeps) {
      if (!_.has(Game.creeps, creepName)) {
        delete Memory.creeps[creepName];
      }
    }
  })
);
