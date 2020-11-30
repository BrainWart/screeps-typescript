import { until } from "os/process/ProcessUtility";
import { RepeatingProcess } from "os/process/RepeatingProcess";
import { Status } from "os/process/Status";
import { Logger } from "utils/Logger";

const NAME = "GeneratePixelProcess";

export class GeneratePixelProcess extends RepeatingProcess<any> {
    constructor(logger: Logger) {
        super(NAME, logger, []);
    }

    protected *loop(): IterableIterator<Status> {
        yield until(() => Game.cpu.bucket === 10_000);
        this.logger.logWarning("Generating pixel!");
        Game.cpu.generatePixel();
    }
}
