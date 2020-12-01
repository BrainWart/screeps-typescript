import { Logger } from "utils/logging/Logger";

export class Task<T> {
  protected logger: Logger;

  constructor(protected creep: Creep, protected memory: T & TaskMemory, logger: Logger) {
    this.logger = logger.scoped(`${memory.task}`, { shard: Game.shard.name, room: creep.room.name });
  }
}
