import harvestSourceHandler from "task/harvestSource";
import upgradeControllerHandler from "task/upgradeController";

const tasks: Record<string, (creep: Creep) => void> = {
  harvestSource: harvestSourceHandler,
  upgradeController: upgradeControllerHandler
};

export default {
  GetTask: (taskName: string) => {
    if (taskName in tasks) {
      return tasks[taskName];
    }

    return (creep: Creep) => {
      console.log(`${creep.name} is trying to ${taskName}`);
    };
  }
};
