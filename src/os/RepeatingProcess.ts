import { Process } from "os/Process";
import { Status, StatusCode } from "os/Status";
import { Logger } from "utils/Logger";

export abstract class RepeatingProcess<T> extends Process<T> {
    constructor(name: string, logger: Logger, memoryPath: string[]) { super(name, logger, memoryPath); }

    protected *doProcess(): IterableIterator<Status> {
        while (true)
        {
            const gen = this.loop()

            let ret : IteratorResult<Status, any>;
            do {
                ret = gen.next();

                if (ret.value) {
                    yield ret.value;
                }
            } while (!ret.done)
        }
    }

    protected abstract loop() : IterableIterator<Status>;
}
