import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";

export class IdleTask extends Task<IdleMemory> {
  constructor(logger: Logger) {
    super("idle", logger);
  }

  public act(creep: Creep, memory: IdleMemory): void {
    if (creep.body.find((part) => part.type === MOVE)) {
      if (creep.memory.task.task === "spawn") {
        const spawn = _.first(creep.room.find(FIND_MY_SPAWNS));

        if (spawn && !creep.pos.isNearTo(spawn)) {
          creep.moveTo(spawn);
        }
      } else {
        this.logger.logDebug(`creep ${creep.id} needs to get off the roads`);
      }
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    throw new Error("IdleTask should not make bodies!");
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): boolean {
    throw new Error("IdleTask should not spawn!");
  }
}
