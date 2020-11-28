import { GeneratePixelProcess } from "game/GeneratePixelProcess";
import { Level1 } from "game/room/Level1/Level1";
import { OS } from "os/OS";
import { ErrorMapper } from "utils/ErrorMapper";
import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";
import { Version } from "utils/Version";

const logger = new Logger("MAIN");

logger.logError(`START - ${Version.name} - ${Version.string}`);

// if (_.isUndefined(Memory.version) || Memory.version.major !== Version.major || Memory.version.branch === "testing") {
//     logger.logWarning("Clearing memory");
//     for (const index in Memory) {
//         delete Memory[index];
//     }

//     logger.logTrace1("Setting built-in memory to objects");
//     Memory.version = Version;
//     Memory.logLevel = Logger.level;
// }

OS.bootstrap((os) => {
    Memory.test = { ...{name: "E56S53", spawnName: "Spawn1"}, ...Memory.test };
    os.addProcess(new Level1(logger, ["test"], os), () => { console.log("level 1 fin"); });
    os.addProcess(new GeneratePixelProcess(logger), () => { console.log("GeneratePixelProcess fin"); });
});

export const loop = ErrorMapper.wrapLoop(() => Timer.log(logger, () => {
    Logger.level = Memory.logLevel;

    OS.tick();
}));
