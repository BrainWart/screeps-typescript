import { ScreepsPrometheus } from "@brainwart/screeps-prometheus-game";
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

// if (Memory.version.major !== version.major || Memory.version.branch === "dev") {
//   logger.logWarning("Clearing memory");
//   for (const index in Memory) {
//     delete Memory[index];
//   }

//   logger.logTrace1("Setting built-in memory to objects");
//   Memory.version = version;
//   Memory.creeps = {};
//   Memory.flags = {};
//   Memory.powerCreeps = {};
//   Memory.rooms = {};
//   Memory.spawns = {};
// }

export const loop = ErrorMapper.wrapLoop(() =>
  Timer.log(logger, () => {
    const prom = new ScreepsPrometheus();

    const cpu = prom.addPrefix("cpu");
    cpu.addGauge("used", Game.cpu.getUsed());
    cpu.addGauge("bucket", Game.cpu.bucket);

    const rooms = prom.addPrefix("room");

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];

      if (room.controller && room.controller.my) {
        const roomSummary = rooms.addLabel("roomName", roomName);

        const controller = roomSummary.addPrefix("controller");
        controller.addGauge("level", room.controller.level).addHelp("Current controller level");
        controller.addGauge("progress", room.controller.progress);
        controller.addGauge("progressNeeded", room.controller.progressTotal);
        controller.addGauge("downgrade", room.controller.ticksToDowngrade);

        if (room.storage) {
          const storage = roomSummary.addPrefix("storage");
          storage.addGauge("energy", 20);
        }
      }
    }

    Memory.stats = prom.build();
  })
);
