import { Logger } from "utils/logging/Logger";
import { Task } from "./Task";

export class SignTask extends Task<SignMemory> {
  constructor(logger: Logger) {
    super("sign", logger);
  }

  public act(creep: Creep, memory: SignMemory) {
    const controller = memory.controllerId && Game.getObjectById(memory.controllerId);

    if (controller && memory.message) {
      if (creep.pos.isNearTo(controller)) {
        creep.signController(controller, memory.message);
      } else {
        creep.moveTo(controller);
      }
    } else {
      this.logger.logInfo(`signer needs memory set {{creeps.${creep.name}.task}([ open memory ])}`);
    }
  }

  public body(energyAvailable: number): BodyPartConstant[] {
    if (energyAvailable < 300) {
      return [];
    }

    return [MOVE];
  }

  public trySpawn(room: Room, spawn: StructureSpawn, potentialCreepName: string, body: BodyPartConstant[]): void {
    spawn.spawnCreep(body, potentialCreepName, {
      memory: { task: { task: "sign" } }
    });
  }
}
