import { Logger } from "utils/Logger";
import { Process } from "./Process";
import { StatusCode } from "./Status";

const logger = new Logger("OS");

export interface ProcessManager {
    addProcess(process: Process<any>, cleanup: () => void): void;
    removeProcess(process: Process<any>): void;
}

export class OS implements ProcessManager {
    private static internalOS: OS = new OS();

    public static bootstrap(setup: (os: OS) => void) {
        logger.logTrace2("bootstrapping");
        setup(this.internalOS);
    }

    public static tick() {
        this.internalOS.tick();
    }

    private processes: Array<{ process: Process<any>, cleanup: () => void }> = [];

    public tick() {
        const finished: Array<Process<any>> = [];

        for (const process of this.processes) {
            const procStatus = process.process.process();

            if (procStatus.code === StatusCode.ERROR) {
                logger.logError(`error in '${process.process.name}': ${procStatus.errorMessage}`);
            }

            if (procStatus.code !== StatusCode.YIELD) {
                finished.push(process.process);
                logger.logWarning(`killing: ${process.process.name}`);
                process.cleanup();
            }
        }

        if (finished.length > 0) {
            this.processes = this.processes.filter((proc) => !finished.includes(proc.process));
        }
        logger.logTrace1(`${finished.length}/${this.processes.length} processes`);
    }

    public addProcess(process: Process<any>, cleanup: () => void) {
        this.processes.unshift({process, cleanup});
    }

    public removeProcess(process: Process<any>) {
        this.processes = this.processes.filter((proc) => !(proc.process === process));
    }
}
