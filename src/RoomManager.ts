import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";

export class RoomManager {
  public static HandleRoom(room: Room) {
    Timer.log(logger.prepend(room.name), () => {
      // Handle room logic here
    });
  }
}

const logger = new Logger(RoomManager.name);

for (const roomName in Game.rooms) {
  const room = Game.rooms[roomName];

  if (room.memory == null) {
    room.memory = {
      creeps: []
    };
  }
}
