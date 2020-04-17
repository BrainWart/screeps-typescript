import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";

export class RoomManager {
  private static managers: { [key: string]: RoomManager } = {};

  private _logger: Logger;
  private _room: Room;

  private constructor(room: Room) {
    this._logger = logger.prepend(room.name);
    this._room = room;

    if (room.memory == null || room.memory.jobs == null || room.memory.map == null) {
      this._logger.log("setting memory");

      room.memory = {
        jobs: [],
        map: []
      };

      this.RefreshMap();
    }
  }

  public static GetManager(room: Room): RoomManager {
    if (RoomManager.managers[room.name]) {
      return RoomManager.managers[room.name];
    }
    return (RoomManager.managers[room.name] = new RoomManager(room));
  }

  public RefreshMap() {
    this._room.memory.map = _.filter(this._room.lookAtArea(0, 0, 50, 50, true), (x) => !(x.creep || x.powerCreep));
  }
}

const logger = new Logger(RoomManager.name);
