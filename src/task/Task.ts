import { Logger } from "utils/logging/Logger";

export abstract class Task<T> {
  protected logger: Logger;

  constructor(type: Tasks, logger: Logger) {
    this.logger = logger.scoped(`${type}`, { shard: Game.shard.name });
  }

  public abstract act(creep: Creep, memory: T & TaskMemory): void;
  public abstract body(energyAvailable: number): BodyPartConstant[];
  public abstract trySpawn(
    room: Room,
    spawn: StructureSpawn,
    potentialCreepName: string,
    body: BodyPartConstant[]
  ): boolean;
}
