import { Logger } from "utils/Logger";
import * as Jobs from "./Jobs";
import { Mine } from "./Mine";

export abstract class Job<T extends Jobs.JobType> {
  protected type: Jobs.JobType;
  protected logger: Logger;

  public abstract DoWork: (creep: Creep) => void;

  constructor() {
    this.logger = new Logger("");
  }

  public static getInstance<T extends Jobs.JobType>(t: T): Job<T> {
    if (t === "mine") {
      return new Mine();
    } else if (t === "upgrader") {
      return new Mine();
    }
    return new Mine();
  }
}
