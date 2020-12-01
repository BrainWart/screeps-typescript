import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";

export class SignTask extends Task<SignMemory> {
  constructor(creep: Creep, memory: SignMemory, logger: Logger) {
    super(creep, memory, logger);
  }

  public act() {
    const controller = this.memory.controllerId && Game.getObjectById(this.memory.controllerId);

    if (controller && this.memory.message) {
      if (this.creep.pos.isNearTo(controller)) {
        this.creep.signController(controller, this.memory.message);
      } else {
        this.creep.moveTo(controller);
      }
    } else {
      this.logger.logInfo(`signer needs memory set {{creeps.${this.creep.name}.task}([ open memory ])}`);
    }
  }
}
