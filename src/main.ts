import { Planner } from "room/Planner";
import { AttackTask } from "task/AttackTask";
import { BuildTask } from "task/BuildTask";
import { HarvestTask } from "task/HarvestTask";
import { IdleTask } from "task/IdleTask";
import { SignTask } from "task/SignTask";
import { SpawnTask } from "task/SpawnTask";
import { Task } from "task/Task";
import { UpgradeTask } from "task/UpgradeTask";
import { ErrorMapper } from "utils/ErrorMapper";
import { Logger } from "utils/logging/Logger";
import { Timer } from "utils/Timer";
import { average } from "utils/Utility";
import { Version } from "utils/Version";
import { logger } from "./utils/Log";

logger.logCrit(`START - ${Version.name} - ${Version.string} - ${Game.shard.name}`);

function badTask(t: never): never;
function badTask(t: TaskMemory) {
  throw new Error("invalid task memory: " + t);
}

function getTask(task: Tasks, taskLogger: Logger = logger): Task<TaskMemory> {
  switch (task) {
    case "upgrade":
      return new UpgradeTask(taskLogger);
    case "harvest":
      return new HarvestTask(taskLogger);
    case "build":
      return new BuildTask(taskLogger);
    case "spawn":
      return new SpawnTask(taskLogger);
    case "attack":
      return new AttackTask(taskLogger);
    case "idle":
      return new IdleTask(taskLogger);
    case "sign":
      return new SignTask(taskLogger);
    default:
      badTask(task);
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  const cpuUsed = Timer.measure(() => {
    if (Game.cpu.bucket === 10000 && Game.shard.name !== "shardSeason") {
      Game.cpu.generatePixel();
      logger.logInfo("generated pixel");
    }

    for (const roomName in Game.rooms) {
      const roomLogger = logger.scoped(roomName, { room: roomName });
      const room = Game.rooms[roomName];

      if (!room.memory || !room.memory.harvestables || !room.memory.constructedForLevel) {
        const harvestables = [...room.find(FIND_SOURCES), ...room.find(FIND_MINERALS)];
        roomLogger.logInfo("found harvestables " + harvestables.join(" "));
        room.memory = {
          constructedForLevel: -1,
          harvestables: _.map(harvestables, (s) => ({ id: s.id, nextSpawn: 0 }))
        };
      }

      if (
        _.any(room.find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax })) ||
        (room.controller && room.controller.ticksToDowngrade < 3000)
      ) {
        roomLogger.logAlert("room has been damaged. enabling safe-mode");
      }

      if (room.controller && room.controller.my) {
        const spawns = room.find(FIND_MY_SPAWNS);

        for (const tower of room.find<StructureTower>(FIND_MY_STRUCTURES, {
          filter: (s) => s instanceof StructureTower
        })) {
          const attack = _.first(
            room.find(FIND_HOSTILE_CREEPS, { filter: (creep) => creep.pos.getRangeTo(tower) < 20 })
          );
          if (attack) {
            tower.attack(attack);
          } else {
            const heal = _.first(room.find(FIND_MY_CREEPS, { filter: (s) => s.hits < s.hitsMax }));
            if (heal) {
              tower.heal(heal);
            } else {
              const repair = _.first(room.find(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax }));
              if (repair && tower.store.getUsedCapacity("energy") > tower.store.getCapacity("energy") / 2) {
                tower.repair(repair);
              }
            }
          }
        }

        // if (room.memory.constructedForLevel < room.controller.level) {
        //   const planner = new Planner(room, roomLogger);
        //   const plan = planner.plan();

        //   roomLogger.logInfo("planning: " + JSON.stringify(_.groupBy(plan, (b) => b.structureType)));
        //   planner.drawPlan(plan);
        //   planner.buildPlan(plan);

        //   room.memory.constructedForLevel = room.controller.level;
        // }

        // tslint:disable: object-literal-sort-keys
        // prettier-ignore
        const workerLimits: Record<Tasks, number> = {
          spawn: 2,
          harvest: room.memory.harvestables.length,
          attack: room.find(FIND_HOSTILE_CREEPS).length > 0 ? 1 : 0,
          build:
            2 +
            Math.floor(
              _.sum(
                room.find(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType === RESOURCE_ENERGY }),
                (r) => r.amount
              ) / 220 / average(_.map(
                Game.creeps,
                (creep) => _.filter(creep.body, (p) => p.type === WORK).length
              ))
            ),
          idle: 0,
          sign: 0,
          upgrade: 1,
        };
        // tslint:enable: object-literal-sort-keys

        for (const creepName in Game.creeps) {
          workerLimits[Game.creeps[creepName].memory.task.task]--;
        }

        roomLogger.logInfo(`workerLimits: \n${JSON.stringify(workerLimits)}`);

        for (const spawn of spawns) {
          if (!spawn.spawning) {
            const potentialCreepName = `${roomName} ${Game.time % 9997}`;

            for (const job in workerLimits) {
              if (workerLimits[job as Tasks] > 0) {
                const task = getTask(job as Tasks);
                const body = task.body(room.energyAvailable);

                if (body && body.length > 0) {
                  if (task.trySpawn(room, spawn, potentialCreepName, body)) {
                    logger.logInfo(
                      `spawned creep ${potentialCreepName} : ${job} : ${String(room)} ${String(spawn)} ${JSON.stringify(
                        body
                      )}`
                    );
                    workerLimits[job as Tasks]--;
                    break;
                  } else {
                    logger.logError(
                      `failed to spawn creep ${potentialCreepName} : ${job} : ${String(room)} ${String(
                        spawn
                      )} ${JSON.stringify(body)}`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    const creepJobTimer = new Timer();

    for (const creepName in Memory.creeps) {
      const creepLogger = logger.scoped("creep " + creepName);

      if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
        creepLogger.logDebug("removing memory");
        continue;
      }

      creepLogger.data = { ...creepLogger.data, ...{ room: Game.creeps[creepName].room.name } };

      const taskLogger = logger.scoped("", { room: Game.creeps[creepName].room.name });

      const creep = Game.creeps[creepName];

      const task = getTask(creep.memory.task.task, taskLogger);
      creepJobTimer.recordTime(creep.memory.task.task, () => task.act(creep, creep.memory.task));
    }

    let creepCpuUsageString = "creep cpu usage:\n";

    const summary = creepJobTimer.summary();
    for (const job in summary) {
      creepCpuUsageString += `${job}: ${summary[job].total.toFixed(3)} [${(
        summary[job].total / summary[job].count
      ).toFixed(3)} avg]\n`;
    }

    creepCpuUsageString += `totals : ${_.sum(summary, (s) => s.total).toFixed(3)} [${(
      _.sum(summary, (s) => s.total) / _.sum(summary, (s) => s.count)
    ).toFixed(3)} avg]`;

    logger.logTrace(creepCpuUsageString);
  });
  logger.logDebug("total cpu  : " + cpuUsed.toFixed(3));

  if (Game.cpu.getHeapStatistics) {
    logger.logDebug(
      "heap usage : " +
        (Game.cpu.getHeapStatistics().used_heap_size / 1024 / 1024).toFixed(3) +
        "MB / " +
        (Game.cpu.getHeapStatistics().heap_size_limit / 1024 / 1024).toFixed(3) +
        "MB"
    );
  }
});
