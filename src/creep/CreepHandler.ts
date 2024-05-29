import { Logger } from "utils/logging/Logger";
import { Version } from "utils/Version";

export function CreepHandler(creep: Creep, logger: Logger) {
  if (creep.spawning) return;

  if (creep.memory.version !== Version.gitDescribe) {
    creep.memory = {
      ...{
      },
      ...creep.memory,
      version: Version.gitDescribe,
    }
  }

  if (!creep.memory.task) {
    const creepTask = creep.room.memory.tasks
      .filter(t => t.creeps.length < (t.maxCreeps ?? Number.MAX_VALUE))
      .sort(x => x.creeps.length)[0];
    creep.memory.task = {
      id: creepTask.id,
      action: creepTask.action
    } as TaskItem;
    creepTask.creeps.push(creep.id);
    logger.logInfo(`assigning task ${creepTask.action} of ${creepTask.id} to [creep #${creep.id}]`)
  }

  switch (creep.memory.task.action) {
    case "harvest": {
      const target = Game.getObjectById(creep.memory.task.id);
      if (target && creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
      if (creep.store.getFreeCapacity() < 1) {
        creep.drop(RESOURCE_ENERGY);
      }
    }
      break;
    case "upgrade": {
      if (creep.store.energy < 1) {
        const best = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: r => r.resourceType === 'energy'
        }).map(r => ({
          resource: r,
          distance: r.pos.getRangeTo(creep),
          amount: r.amount,
        })).sort(t => t.distance * 10 + Math.pow(t.amount, 0.8)).map(t => t.resource).find(x => x)

        if (best && creep.pickup(best) === ERR_NOT_IN_RANGE) {
          creep.moveTo(best);
        }
      } else if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller)
        }
      }
    }
      break;
    case "transfer": {
      
    }
      break;
  }
}