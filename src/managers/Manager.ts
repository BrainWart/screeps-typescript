import { Logger } from "../utils/Logger";

export class Manager {
  protected logger: Logger;
  protected room: Room;

  protected constructor(named: { name: string }, room: Room) {
    this.logger = new Logger(named.name).prepend(room.name);
    this.room = room;
  }

  public static GetManager<T extends Manager>(c: new (room: Room) => T, room: Room): T {
    return new c(room);
  }
}
