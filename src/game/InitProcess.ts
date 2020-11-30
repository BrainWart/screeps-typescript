import { ProcessManager } from "os/OS";
import { forTicks } from "os/process/ProcessUtility";
import { RepeatingProcess } from "os/process/RepeatingProcess";
import { Status } from "os/process/Status";
import { Logger } from "utils/Logger";

const NAME = "INIT";

interface InitMemory {
    rooms: { [key: string]: RoomMemory }
}

export class InitProcess extends RepeatingProcess<InitMemory> {
    constructor(logger: Logger, memoryPath: string[], private os: ProcessManager) {
        super(NAME, logger, memoryPath);
    }

    protected doProcess(): IterableIterator<Status> {
        // Do set up

        return super.doProcess();
    }

    protected *loop(): IterableIterator<Status> {
        for (const roomName in this.memory().rooms) { ; }
        yield forTicks(10);
        this.logger.logTrace1("running init");
    }
}
