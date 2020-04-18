import { Job } from "./Job";
import * as Jobs from "./Jobs";

export class Mine extends Job<Jobs.MineType> {
  public DoWork = (creep: Creep) => {
    const target = Game.getObjectById(creep.memory.job.target);
    if (target instanceof Source) {
      //
    }
  };
}
