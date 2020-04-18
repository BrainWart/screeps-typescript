import { Manager } from "managers/Manager";
import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";

export class RoomManager extends Manager {
  constructor(room: Room) {
    super(RoomManager, room);

    if (room.memory == null || room.memory.jobs == null || room.memory.map == null) {
      this.logger.log("setting memory");

      room.memory = {
        highlights: {
          exits: [],
          minerals: [],
          sources: []
        },
        jobs: [],
        map: []
      };

      this.RefreshMap();
    }
  }

  public RefreshMap() {
    Timer.log(this.logger.prepend(this.RefreshMap.name), () => {
      const localMap = _.map(Array(50), (n) => Array(50));
      const foundList = _.filter(this.room.lookAtArea(0, 0, 49, 49, true), (x) => !(x.creep || x.powerCreep));

      for (const found of foundList) {
        switch (found.type) {
          case LOOK_TERRAIN:
            localMap[found.y][found.x] = found.terrain;
            break;
          case LOOK_SOURCES:
            if (found.source && !_.find(this.room.memory.highlights.sources, { id: found.source.id })) {
              this.room.memory.highlights.sources.unshift({ id: found.source.id, pos: found.source.pos });
            }
            break;
          case LOOK_MINERALS:
            if (found.mineral && !_.find(this.room.memory.highlights.minerals, { id: found.mineral.id })) {
              this.room.memory.highlights.minerals.unshift({ id: found.mineral.id, pos: found.mineral.pos });
            }
            break;
          default:
            this.logger.logTrace2(`not handling ${found.type}`);
        }
      }

      this.room.memory.map = localMap;
    });
  }
}

const logger = new Logger(RoomManager.name);
