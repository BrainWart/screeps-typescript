import { Harvest } from "./Harvest";
import { Upgrade } from "./Upgrade";

function badTask(t: never): never;
function badTask(t: TaskMemory) { throw new Error("invalid task memory: " + t); }

export class Task {
  public static forCreep(creep: Creep) {
    if (creep.memory.tasks.length > 0) {
      const currentTask = creep.memory.tasks[0];
      switch (currentTask.task) {
        case "upgrade":
          new Upgrade(creep, currentTask).act();
          break;
        case "harvest":
          new Harvest(creep, currentTask).act();
          break;
        default:
          badTask(currentTask);
      }
    }
  }
}
