import { defaultCipherList } from "constants";
import { ProcessManager } from "os/OS";
import { forTicks, until } from "os/process/ProcessUtility";
import { RepeatingProcess } from "os/process/RepeatingProcess";
import { Status, StatusCode } from "os/process/Status";
import { memoryUsage } from "process";
import { Logger } from "utils/Logger";

const NAME = "SimpleUpgradeProcess";

export interface SimpleUpgradeProcessMemory {
    creepName: string;
    controllerId: Id<StructureController>;
    upgrading: boolean;
}

export class SimpleUpgradeProcess extends RepeatingProcess<SimpleUpgradeProcessMemory> {
    private creep: () => Creep;
    private controller: StructureController | null;

    constructor(logger: Logger, memoryPath: string[]) {
        super(NAME, logger, memoryPath);

        this.creep = () => Game.creeps[this.memory().creepName];
        this.controller = Game.getObjectById(this.memory().controllerId);
    }

    protected *loop(): IterableIterator<Status> {
        if (!this.creep()) {
            return { code: StatusCode.ERROR, message: `creep '${this.memory().creepName}' not found`};
        }
        if (!this.controller) {
            return { code: StatusCode.ERROR, message: `controller {${this.memory().controllerId}} not found`};
        }

        yield until(() => !!this.creep() && !this.creep().spawning);

        if (this.memory().upgrading && this.creep().store.getUsedCapacity() > 0) {
            const upgradeControllerError = this.creep().upgradeController(this.controller);
            switch (upgradeControllerError) {
                case ERR_NOT_IN_RANGE:
                    yield until(() => this.creep().fatigue === 0);
                    this.creep().moveTo(this.controller);
                    break;
                case OK:
                    break;
                default:
                    this.logger.logError(`upgradeController failed with ${upgradeControllerError}`)
            }
        } else {
            this.memory().upgrading = false;

            const goals = this.creep().room.find(FIND_SOURCES_ACTIVE);
            const pathRet = PathFinder.search(this.creep().pos,
                _.map(goals, (source) => ({ pos: source.pos, range: 1 })));

            if (!pathRet.incomplete) {
                for (const roomPosition of pathRet.path) {
                    let ret: CreepMoveReturnCode;
                    do {
                        this.creep().room.visual.poly(pathRet.path, { lineStyle: "dashed" });
                        ret = this.creep().move(this.creep().pos.getDirectionTo(roomPosition));
                        yield until(() => this.creep().fatigue === 0);
                    } while (!this.creep().pos.isEqualTo(roomPosition))
                }
            }

            const target = _.find(goals, (goal) => this.creep().pos.isNearTo(goal));
            if (target) {
                while (this.creep().store.getFreeCapacity() > 0) {
                    this.creep().harvest(target);
                    yield forTicks(0);
                }
            }

            this.memory().upgrading = true;
        }
    }
}
