import { SimpleUpgradeProcess, SimpleUpgradeProcessMemory } from "game/room/Level1/SimpleUpgradeProcess";
import { ProcessManager } from "os/OS";
import { forTicks, hasOwnProperty, until } from "os/process/ProcessUtility";
import { RepeatingProcess } from "os/process/RepeatingProcess";
import { Status, StatusCode } from "os/process/Status";
import { Logger } from "utils/Logger";

const NAME = "Layout";

interface RoomLayoutMemory {

}

interface LayoutMemory {
    layouts: {[key: string]: RoomLayoutMemory};
}

const defaultMemory: LayoutMemory = {
    layouts: {},
}

export class LayoutProcess extends RepeatingProcess<LayoutMemory> {
    constructor(logger: Logger, memory: string[]) {
        super(NAME, logger, memory);
    }

    protected *loop(): IterableIterator<Status> {
        for (const roomName in Game.rooms) {
            ;
        }
    }
}
