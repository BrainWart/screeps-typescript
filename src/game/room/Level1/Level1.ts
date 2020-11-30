import { SimpleUpgradeProcess, SimpleUpgradeProcessMemory } from "game/room/Level1/SimpleUpgradeProcess";
import { ProcessManager } from "os/OS";
import { forTicks, hasOwnProperty, until } from "os/process/ProcessUtility";
import { RepeatingProcess } from "os/process/RepeatingProcess";
import { Status, StatusCode } from "os/process/Status";
import { Logger } from "utils/Logger";

const NAME = "Level1";

interface RoomMemory {
    name: string;
    procMem: {[key: string]: object};
    spawnName: string;
}

const defaultMemory: RoomMemory = {
    name: "",
    procMem: {},
    spawnName: "",
}

export class Level1 extends RepeatingProcess<RoomMemory> {
    private os: ProcessManager;

    constructor(logger: Logger, memory: string[], os: ProcessManager) {
        super(NAME, logger, memory);

        this.os = os;

        for (const ind in this.memory().procMem) {
            const mem = this.memory().procMem[ind];

            if (hasOwnProperty(mem, 'controllerId') && typeof mem.controllerId === "string") {
                this.os.addProcess(new SimpleUpgradeProcess(this.logger, [...this.memoryPath, "procMem", String(ind)]), () => {
                    delete this.memory().procMem[ind];
                });
            }
        }
    }

    protected *loop(): IterableIterator<Status> {
        this.logger.logTrace1("looping");
        yield until(() => Game.rooms[this.memory().name].energyAvailable === Game.rooms[this.memory().name].energyCapacityAvailable);

        const room = Game.rooms[this.memory().name];
        if (!room.controller) { return { code: StatusCode.ERROR, message: `controller for room '${this.memory.name}' not found`}; }

        const mem = {
            controllerId: room.controller.id,
            creepName: `${room.name}-${Game.time % 9973}`,
            upgrading: false,
        };

        this.memory().procMem[mem.creepName] = mem;
        Game.spawns[this.memory().spawnName].spawnCreep([WORK, MOVE, MOVE, CARRY, CARRY], mem.creepName);
        this.os.addProcess(new SimpleUpgradeProcess(this.logger, [...this.memoryPath, "procMem", mem.creepName]), () => {
            console.log("worker fin");
            delete this.memory().procMem[mem.creepName];
        });
    }
}
