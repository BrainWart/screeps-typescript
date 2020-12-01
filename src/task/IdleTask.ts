import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";

export class IdleTask extends Task<IdleMemory> {
  constructor(creep: Creep, memory: IdleMemory, logger: Logger) {
    super(creep, memory, logger);
  }

  public act() {
    if (this.creep.body.find((part) => part.type === MOVE)) {
      this.logger.logDebug(`creep ${this.creep.id} needs to get off the roads`);
    }
  }
}
