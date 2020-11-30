import { Logger } from "utils/Logger";
import { Status, StatusCode } from "./Status";

export abstract class Process<T> {
    private innerProcess: Array<IterableIterator<Status>>;

    constructor(public name: string, protected logger: Logger, protected memoryPath: string[]) {
        this.logger = logger.prepend(name);
        this.innerProcess = [ this.doProcess() ];
    }

    protected abstract doProcess() : IterableIterator<Status>;

    public process() : Status {
        let processReturn : IteratorResult<Status>;

        do {
            processReturn = this.innerProcess[0].next();
            if (processReturn.done) {
                this.innerProcess.shift();
            } else {
                const returnCode = processReturn.value;
                if (returnCode.code === StatusCode.YIELD && returnCode.pauseGen) {
                    this.innerProcess.unshift(returnCode.pauseGen());
                }
            }
        } while (processReturn.done && this.innerProcess.length > 0)

        if (processReturn && processReturn.value) {
            return processReturn.value;
        } else {
            this.logger.logWarning("completed by accident");
            return { code: StatusCode.COMPLETE };
        }
    }

    protected memory() : T { return _.get(Memory, this.memoryPath); }
}
