import Level1Handler from "room/level1";
import Level2Handler from "room/level2";

export default {
  Manage: (room: Room) => {
    if (room.controller && room.controller.my) {
      if (room.controller.level === 1) {
        Level1Handler(room);
      } else {
        Level2Handler(room);
      }
    }
  }
};
