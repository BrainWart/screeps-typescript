import * as Jobs from "jobs/Jobs";
import { Manager } from "managers/Manager";
import { RoomManager } from "managers/RoomManager";
import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";

export class JobManager extends Manager {
  constructor(room: Room) {
    super(JobManager, room);

    if (room.memory == null || room.memory.jobs == null || room.memory.map == null) {
      this.logger.logError("room memory is null");
    }
  }

  public CheckJobs() {
    Timer.log(logger.prepend(this.CheckJobs.name), () => {
      for (const source of this.room.memory.highlights.sources) {
        if (source) {
          //
        }
      }
    });
  }
}

const logger = new Logger(JobManager.name);
