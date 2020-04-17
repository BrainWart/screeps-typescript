import { Logger } from "utils/Logger";
import { Timer } from "utils/Timer";

export class JobManager {
  private _logger: Logger;
  private _room: Room;

  constructor(room: Room) {
    this._logger = logger.prepend(room.name);
    this._room = room;

    if (room.memory == null || room.memory.jobs == null || room.memory.map == null) {
      this._logger.logError("room memory is null");
    }
  }

  public CheckJobs() {
    // Check for jobs
  }
}

const logger = new Logger(JobManager.name);
